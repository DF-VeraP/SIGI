/**
 * SIGI - Asistente Predictivo de Machine Learning en Tiempo Real
 * Analiza descripciones de incidentes con NLP y sugiere tipo, gravedad y recursos de auxilio.
 */

class SigiMLAssistant {
  constructor(options = {}) {
    this.textareaId = options.textareaId || 'descripcion';
    this.tipoSelectId = options.tipoSelectId || 'tipoIncidente';
    this.gravedadSelectId = options.gravedadSelectId || 'gravedad';
    this.horaInputId = options.horaInputId || 'hora';
    this.containerId = options.containerId || 'mlAssistantContainer';
    this.chkPoliciaId = options.chkPoliciaId || 'chkPolicia';
    this.chkAmbulanciaId = options.chkAmbulanciaId || 'chkAmbulancia';
    this.chkBomberosId = options.chkBomberosId || 'chkBomberos';

    this.debounceTimer = null;
    this.ultimaPrediccion = null;

    this.init();
  }

  init() {
    const textarea = document.getElementById(this.textareaId);
    if (!textarea) return;

    // Crear contenedor visual para el widget de IA si no existe
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'sigi-ml-card';
      container.style.display = 'none';
      textarea.parentNode.insertBefore(container, textarea.nextSibling);
    }

    // Insertar estilos del asistente ML
    this.injectStyles();

    // Event listener en el textarea con debounce (450ms)
    textarea.addEventListener('input', (e) => {
      const texto = e.target.value.trim();
      clearTimeout(this.debounceTimer);

      if (texto.length < 8) {
        container.style.display = 'none';
        return;
      }

      this.debounceTimer = setTimeout(() => {
        this.analizarTexto(texto);
      }, 450);
    });
  }

  injectStyles() {
    if (document.getElementById('sigi-ml-styles')) return;

    const style = document.createElement('style');
    style.id = 'sigi-ml-styles';
    style.textContent = `
      .sigi-ml-card {
        margin-top: 10px;
        padding: 12px 14px;
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95));
        border: 1px solid rgba(56, 189, 248, 0.35);
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), 0 0 15px rgba(56, 189, 248, 0.15);
        color: #f1f5f9;
        font-family: inherit;
        font-size: 0.82rem;
        transition: all 0.3s ease;
        backdrop-filter: blur(8px);
      }
      .sigi-ml-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .sigi-ml-badge-ai {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 8px;
        background: rgba(37, 99, 235, 0.15);
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 20px;
        color: #3b82f6;
        font-weight: 600;
        font-size: 0.76rem;
      }
      .sigi-ml-body {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
      }
      .sigi-ml-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }
      .sigi-ml-tipo-title {
        font-weight: 700;
        color: #ffffff;
        font-size: 0.9rem;
      }
      .sigi-ml-confianza-bar-wrap {
        width: 100%;
        background: rgba(255, 255, 255, 0.1);
        height: 6px;
        border-radius: 3px;
        overflow: hidden;
        margin-top: 4px;
      }
      .sigi-ml-confianza-bar {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #6366f1);
        border-radius: 3px;
        transition: width 0.4s ease;
      }
      .sigi-ml-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 4px;
      }
      .sigi-ml-tag {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 2px 7px;
        border-radius: 12px;
        font-size: 0.72rem;
        color: #cbd5e1;
      }
      .sigi-ml-tag-gravedad {
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 12px;
      }
      .sigi-ml-btn-aplicar {
        background: linear-gradient(135deg, #0284c7, #2563eb);
        color: #ffffff;
        border: none;
        padding: 7px 12px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.78rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .sigi-ml-btn-aplicar:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
      }
      .sigi-ml-aplicado {
        color: #10b981;
        font-weight: 600;
        font-size: 0.75rem;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
    `;
    document.head.appendChild(style);
  }

  async analizarTexto(texto) {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    try {
      const horaInput = document.getElementById(this.horaInputId);
      const hora = horaInput ? horaInput.value : null;

      const res = await fetch('/api/ml/predecir-incidente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion: texto, hora })
      });

      if (!res.ok) return;

      const payload = await res.json();
      if (payload.status === 'success' && payload.data) {
        this.ultimaPrediccion = payload.data;
        this.renderPrediccion(payload.data);
      }
    } catch (err) {
      console.warn('Error conectando al servicio de ML:', err);
    }
  }

  renderPrediccion(data) {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const { tipo, gravedad, asistencias } = data;

    const factoresHtml = gravedad.factores_detectados.length > 0
      ? gravedad.factores_detectados.map(f => `<span class="sigi-ml-tag">⚠️ ${f}</span>`).join('')
      : '<span class="sigi-ml-tag">Evaluación estándar</span>';

    const asistenciasHtml = [];
    if (asistencias.policia) asistenciasHtml.push('👮 Policía');
    if (asistencias.ambulancia) asistenciasHtml.push('🚑 Ambulancia');
    if (asistencias.bomberos) asistenciasHtml.push('🚒 Bomberos');

    container.innerHTML = `
      <div class="sigi-ml-header">
        <span class="sigi-ml-badge-ai">
          <i class="bi bi-cpu-fill"></i> Asistente de Inteligencia Artificial (SIGI ML)
        </span>
        <button type="button" class="sigi-ml-btn-aplicar" id="btnAplicarSugerenciaML">
          <i class="bi bi-magic"></i> Aplicar sugerencia
        </button>
      </div>

      <div class="sigi-ml-body">
        <div class="sigi-ml-row">
          <div>
            <div class="sigi-ml-tipo-title">${tipo.nametipoincidente}</div>
            <div style="font-size: 0.72rem; color: #94a3b8;">
              Confianza del modelo: <b>${tipo.confianza}%</b>
            </div>
          </div>
          <div>
            <span class="sigi-ml-tag-gravedad" style="background: ${gravedad.color}22; color: ${gravedad.color}; border: 1px solid ${gravedad.color};">
              Gravedad ${gravedad.nivel} (${gravedad.etiqueta})
            </span>
          </div>
        </div>

        <div class="sigi-ml-confianza-bar-wrap">
          <div class="sigi-ml-confianza-bar" style="width: ${Math.min(100, Math.max(20, tipo.confianza))}%;"></div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; flex-wrap: wrap; gap: 6px;">
          <div class="sigi-ml-tags">
            ${factoresHtml}
          </div>
          <div style="font-size: 0.72rem; color: #cbd5e1;">
            Auxilio sugerido: <b>${asistenciasHtml.join(', ') || 'Policía preventiva'}</b>
          </div>
        </div>
        <div id="mlFeedbackMensaje" style="display: none; margin-top: 4px;"></div>
      </div>
    `;

    container.style.display = 'block';

    const btnAplicar = document.getElementById('btnAplicarSugerenciaML');
    if (btnAplicar) {
      btnAplicar.addEventListener('click', () => {
        this.aplicarSugerencias();
      });
    }
  }

  aplicarSugerencias() {
    if (!this.ultimaPrediccion) return;

    const { tipo, gravedad, asistencias } = this.ultimaPrediccion;

    // 1. Asignar Tipo de Incidente
    const selectTipo = document.getElementById(this.tipoSelectId);
    if (selectTipo) {
      selectTipo.value = String(tipo.idtipoincidente);
      selectTipo.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 2. Asignar Gravedad
    const selectGravedad = document.getElementById(this.gravedadSelectId);
    if (selectGravedad) {
      selectGravedad.value = String(gravedad.nivel);
      selectGravedad.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 3. Asignar Asistencias requeridas (Checkboxes)
    const chkPol = document.getElementById(this.chkPoliciaId);
    const chkAmb = document.getElementById(this.chkAmbulanciaId);
    const chkBom = document.getElementById(this.chkBomberosId);

    if (chkPol && asistencias.policia !== undefined) chkPol.checked = asistencias.policia;
    if (chkAmb && asistencias.ambulancia !== undefined) chkAmb.checked = asistencias.ambulancia;
    if (chkBom && asistencias.bomberos !== undefined) chkBom.checked = asistencias.bomberos;

    // Feedback visual
    const feedback = document.getElementById('mlFeedbackMensaje');
    if (feedback) {
      feedback.className = 'sigi-ml-aplicado';
      feedback.innerHTML = '<i class="bi bi-check-circle-fill"></i> ¡Sugerencias de Tipo, Gravedad y Recursos aplicadas con éxito!';
      feedback.style.display = 'block';
    }
  }
}

// Exponer globalmente
window.SigiMLAssistant = SigiMLAssistant;
