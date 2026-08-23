/**
 * Smart Report Médico — regras preventivas (sem diagnóstico).
 * Consolida métricas, tendências e desvios para apoio à consulta.
 */

const LIMITE_HISTORICO = 14;

const REFERENCIAS = {
    bpm_repouso: { idealMin: 60, idealMax: 80, alertaAlto: 90, alertaBaixo: 50, unidade: 'BPM' },
    passos_diarios: { idealMin: 7000, alertaBaixo: 5000, unidade: 'passos' },
    horas_sono: { idealMin: 7, idealMax: 9, alertaBaixo: 6, unidade: 'h' },
};

function media(valores) {
    if (!valores.length) return null;
    return valores.reduce((a, b) => a + b, 0) / valores.length;
}

function deltaPercentual(atual, base) {
    if (base == null || base === 0) return null;
    return ((atual - base) / Math.abs(base)) * 100;
}

function formatarData(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function registrarLeitura(registroAtual, leitura) {
    const historico = Array.isArray(registroAtual?.historico)
        ? [...registroAtual.historico]
        : [];

    historico.push({
        bpm_repouso: leitura.bpm_repouso,
        passos_diarios: leitura.passos_diarios,
        horas_sono: leitura.horas_sono,
        data_sincronizacao: leitura.data_sincronizacao,
    });

    while (historico.length > LIMITE_HISTORICO) {
        historico.shift();
    }

    return {
        paciente_id: leitura.paciente_id,
        nome: leitura.nome,
        bpm_repouso: leitura.bpm_repouso,
        passos_diarios: leitura.passos_diarios,
        horas_sono: leitura.horas_sono,
        data_sincronizacao: leitura.data_sincronizacao,
        historico,
    };
}

function avaliarIndicador(nome, valor, serie, refs) {
    const alertas = [];
    const tendencias = [];
    let status = 'estavel';

    if (refs.alertaAlto != null && valor > refs.alertaAlto) {
        alertas.push({
            nivel: 'atencao',
            texto: `${nome} elevado (${valor} ${refs.unidade}) em relação ao limiar preventivo de ${refs.alertaAlto} ${refs.unidade}.`,
        });
        status = 'atencao';
    }
    if (refs.alertaBaixo != null && valor < refs.alertaBaixo) {
        alertas.push({
            nivel: 'atencao',
            texto: `${nome} abaixo do esperado (${valor} ${refs.unidade}; limiar ${refs.alertaBaixo} ${refs.unidade}).`,
        });
        status = 'atencao';
    }

    const baseline = media(serie.slice(0, -1).map((p) => p.valor));
    if (baseline != null && serie.length >= 2) {
        const delta = deltaPercentual(valor, baseline);
        const sentido = delta >= 0 ? 'acima' : 'abaixo';
        tendencias.push({
            indicador: nome,
            texto: `${nome}: ${Math.abs(delta).toFixed(1)}% ${sentido} da média individual recente (${baseline.toFixed(1)} ${refs.unidade}).`,
            delta,
        });
        if (Math.abs(delta) >= 15) {
            alertas.push({
                nivel: 'desvio',
                texto: `Desvio relevante em ${nome} em relação ao padrão individual do paciente.`,
            });
            if (status === 'estavel') status = 'desvio';
        }
    }

    return { status, alertas, tendencias };
}

function gerarSmartReport(paciente) {
    if (!paciente) return null;

    const historico = Array.isArray(paciente.historico) && paciente.historico.length
        ? paciente.historico
        : [{
            bpm_repouso: paciente.bpm_repouso,
            passos_diarios: paciente.passos_diarios,
            horas_sono: paciente.horas_sono,
            data_sincronizacao: paciente.data_sincronizacao,
        }];

    const atual = historico[historico.length - 1];
    const series = {
        bpm_repouso: historico.map((h) => ({ valor: h.bpm_repouso, data: h.data_sincronizacao })),
        passos_diarios: historico.map((h) => ({ valor: h.passos_diarios, data: h.data_sincronizacao })),
        horas_sono: historico.map((h) => ({ valor: h.horas_sono, data: h.data_sincronizacao })),
    };

    const bpm = avaliarIndicador('BPM de repouso', atual.bpm_repouso, series.bpm_repouso, REFERENCIAS.bpm_repouso);
    const passos = avaliarIndicador('Passos diários', atual.passos_diarios, series.passos_diarios, REFERENCIAS.passos_diarios);
    const sono = avaliarIndicador('Horas de sono', atual.horas_sono, series.horas_sono, REFERENCIAS.horas_sono);

    const alertas = [...bpm.alertas, ...passos.alertas, ...sono.alertas];
    const tendencias = [...bpm.tendencias, ...passos.tendencias, ...sono.tendencias];

    let resumoClinico = 'Indicadores dentro de faixa preventiva estável com base nos dados disponíveis.';
    if (alertas.some((a) => a.nivel === 'atencao')) {
        resumoClinico = 'Há indicadores fora dos limiares preventivos. Recomenda-se abordar hábitos e contexto clínico na consulta.';
    } else if (alertas.some((a) => a.nivel === 'desvio')) {
        resumoClinico = 'Foram identificados desvios em relação ao padrão individual recente do paciente.';
    }

    return {
        paciente_id: paciente.paciente_id,
        nome: paciente.nome,
        gerado_em: new Date().toISOString(),
        data_ultima_sincronizacao: paciente.data_sincronizacao,
        leituras_disponiveis: historico.length,
        indicadores: {
            bpm_repouso: { valor: atual.bpm_repouso, status: bpm.status, unidade: 'BPM' },
            passos_diarios: { valor: atual.passos_diarios, status: passos.status, unidade: 'passos' },
            horas_sono: { valor: atual.horas_sono, status: sono.status, unidade: 'h' },
        },
        tendencias,
        alertas,
        resumo_clinico: resumoClinico,
        aviso_legal: 'Documento de apoio à decisão clínica com PGHD. Não constitui diagnóstico médico.',
        historico: historico.map((h) => ({
            ...h,
            data_formatada: formatarData(h.data_sincronizacao),
        })),
    };
}

module.exports = {
    registrarLeitura,
    gerarSmartReport,
    formatarData,
    REFERENCIAS,
};
