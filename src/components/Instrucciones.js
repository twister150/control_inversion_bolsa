'use client';

export default function Instrucciones() {
    return (
        <div>
            {/* ── Cabecera ──────────────────────────────── */}
            <div className="strategy-header">
                <div className="strategy-icon a" style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    📖
                </div>
                <div>
                    <h2 className="strategy-name">¿Cómo funciona este sistema?</h2>
                    <p className="strategy-desc">
                        Guía completa para entender el Arbitraje del Miedo, paso a paso, tanto si eres experto como si nunca has invertido.
                    </p>
                </div>
            </div>

            {/* ── Sección 1: Qué es esto ────────────────── */}
            <div className="form-container" style={{ marginBottom: 20 }}>
                <h3 className="form-title">🎯 ¿Qué es el «Arbitraje del Miedo»?</h3>

                <div className="strategy-rules" style={{ marginBottom: 16 }}>
                    <p style={{ marginBottom: 12, color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        💡 Explicación sencilla:
                    </p>
                    <p style={{ marginBottom: 12 }}>
                        Imagina que las acciones de las mejores empresas del mundo son como productos en un supermercado.
                        A veces, por un susto general del mercado (como una crisis económica, una mala noticia temporal, o simplemente pánico colectivo),
                        esos «productos» se ponen <strong>en rebajas enormes</strong>.
                    </p>
                    <p style={{ marginBottom: 12 }}>
                        Este sistema <strong>no predice el futuro</strong>. Lo que hace es vigilar constantemente los precios y avisarte
                        cuando una empresa excelente está cotizando a un precio que, estadísticamente, es una anomalía —
                        es decir, un precio que históricamente ha sido raro y que <em>suele</em> recuperarse.
                    </p>
                    <p>
                        Piénsalo así: <strong>cuando todo el mundo vende asustado, tú compras con calma</strong>. No estás apostando,
                        estás comprando rebajado algo que tiene un valor real mucho mayor.
                    </p>
                </div>

                <div className="strategy-rules">
                    <p style={{ marginBottom: 12, color: 'var(--accent-purple)', fontWeight: 600 }}>
                        🔬 Explicación técnica:
                    </p>
                    <p>
                        El sistema implementa dos estrategias de mean-reversion que explotan desviaciones extremas respecto a medias móviles de largo plazo (SMA 200D y SMA 200W)
                        y caídas históricas desde ATH (All-Time High). No se utilizan algoritmos predictivos ni modelos de machine learning;
                        las señales se basan exclusivamente en reglas matemáticas deterministas aplicadas a datos de mercado.
                    </p>
                </div>
            </div>

            {/* ── Sección 2: Las dos estrategias ─────────── */}
            <div className="form-container" style={{ marginBottom: 20 }}>
                <h3 className="form-title">⚡ Estrategia A — «Cazador de Pánico» (BNF)</h3>

                <div className="strategy-rules" style={{ marginBottom: 16 }}>
                    <p style={{ marginBottom: 12, color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        💡 Explicación sencilla:
                    </p>
                    <p style={{ marginBottom: 12 }}>
                        Imagina que durante los últimos 200 días laborables, calculas el precio medio de una acción. Eso es la <strong>SMA 200</strong>
                        (Media Móvil Simple de 200 días). Es como sacar la nota media de un alumno en un curso entero: te dice cuál es su nivel «normal».
                    </p>
                    <p style={{ marginBottom: 12 }}>
                        Cuando el precio cae <strong>más de un 20%</strong> por debajo de esa media, algo inusual está pasando.
                        Estadísticamente, es como si el mejor alumno de la clase sacara un 4: probablemente es algo puntual y va a volver a sus notas habituales.
                    </p>
                    <p style={{ marginBottom: 12 }}>
                        Esta estrategia busca exactamente eso: <strong>comprar en la anomalía y vender cuando vuelve a la normalidad</strong> (la media)
                        o cuando ganas un +25%.
                    </p>
                    <p>
                        <strong>Empresas vigiladas:</strong> NVIDIA, Tesla, Meta, AMD, Netflix — empresas tecnológicas volátiles que tienden a tener rebotes fuertes.
                    </p>
                </div>

                <div className="strategy-rules">
                    <p style={{ marginBottom: 12, color: 'var(--accent-purple)', fontWeight: 600 }}>
                        🔬 Detalle técnico:
                    </p>
                    <p style={{ marginBottom: 8 }}>
                        <strong>Indicador:</strong> SMA 200 diaria (Media Móvil Simple de los últimos 200 días de cotización).
                    </p>
                    <p style={{ marginBottom: 8 }}>
                        <strong>Regla de activación:</strong> <code>Precio Actual &lt; SMA 200 × 0.80</code>
                    </p>
                    <p style={{ marginBottom: 8 }}>
                        <strong>Gestión de posición:</strong> Entrada con 50% del capital asignado. Si cae un 10% adicional, se entra con el 50% restante (dollar-cost averaging en la caída).
                    </p>
                    <p>
                        <strong>Salida:</strong> El precio toca la SMA 200 (reversión a la media) <em>o</em> se alcanza un +25% sobre el precio medio de compra.
                    </p>
                </div>
            </div>

            <div className="form-container" style={{ marginBottom: 20 }}>
                <h3 className="form-title">🏛️ Estrategia B — «Bóveda Chandler» (Largo Plazo)</h3>

                <div className="strategy-rules" style={{ marginBottom: 16 }}>
                    <p style={{ marginBottom: 12, color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        💡 Explicación sencilla:
                    </p>
                    <p style={{ marginBottom: 12 }}>
                        El <strong>ATH</strong> (All-Time High) es el precio más alto que ha alcanzado una acción <em>en toda su historia</em>.
                        Es como el récord personal de un atleta.
                    </p>
                    <p style={{ marginBottom: 12 }}>
                        Esta estrategia funciona así: si Apple alcanzó un máximo histórico de 200€ y ahora cotiza a 140€, ha caído un 30%
                        desde su récord. Eso activa el <strong>Tramo 1</strong>.
                    </p>
                    <p style={{ marginBottom: 12 }}>
                        La idea es <strong>comprar escalonadamente</strong> según lo «barata» que esté:
                    </p>
                    <ul style={{ paddingLeft: 24, marginBottom: 12 }}>
                        <li style={{ marginBottom: 6 }}>
                            <strong style={{ color: 'var(--accent-orange)' }}>Tramo 1 (caída ≥ 30%)</strong> — «Está en rebajas». Inviertes un poco (20% de tu capital destinado).
                        </li>
                        <li style={{ marginBottom: 6 }}>
                            <strong style={{ color: '#ff7043' }}>Tramo 2 (caída ≥ 50%)</strong> — «Está de liquidación». Inviertes más (30% del capital).
                        </li>
                        <li style={{ marginBottom: 6 }}>
                            <strong style={{ color: 'var(--accent-red)' }}>Zona Chandler (caída ≥ 65%)</strong> — «Es Black Friday». Inviertes el resto (50% del capital). Esto es MUY raro.
                        </li>
                    </ul>
                    <p>
                        <strong>Empresas vigiladas:</strong> Apple, Microsoft, Google, Amazon, Nike, Costco, LVMH, Berkshire Hathaway, Visa — las empresas más grandes y sólidas del planeta.
                        Son empresas que <em>probablemente</em> existirán dentro de 20 años.
                    </p>
                </div>

                <div className="strategy-rules">
                    <p style={{ marginBottom: 12, color: 'var(--accent-purple)', fontWeight: 600 }}>
                        🔬 Detalle técnico:
                    </p>
                    <p style={{ marginBottom: 8 }}>
                        <strong>Indicadores:</strong> ATH (All-Time High) + SMA 200 semanal.
                    </p>
                    <p style={{ marginBottom: 8 }}>
                        <strong>Sistema escalonado:</strong>
                    </p>
                    <ul style={{ paddingLeft: 24, marginBottom: 12 }}>
                        <li style={{ marginBottom: 4 }}>Tramo 1: <code>Caída ≥ 30% desde ATH → 20% del capital</code></li>
                        <li style={{ marginBottom: 4 }}>Tramo 2: <code>Caída ≥ 50% desde ATH O Precio ≤ SMA 200W → 30% del capital</code></li>
                        <li style={{ marginBottom: 4 }}>Tramo 3: <code>Caída ≥ 65% desde ATH → 50% del capital</code></li>
                    </ul>
                    <p>
                        <strong>Salida:</strong> No se vende hasta que el precio supere el ATH previo. Horizonte: 2-5 años.
                        Se trata de capturar la recuperación completa del ciclo de mercado.
                    </p>
                </div>
            </div>

            {/* ── Sección 3: Conceptos clave ─────────────── */}
            <div className="form-container" style={{ marginBottom: 20 }}>
                <h3 className="form-title">📚 Glosario — Conceptos clave explicados</h3>

                <div style={{ display: 'grid', gap: 12 }}>
                    {[
                        {
                            termino: 'SMA 200 (Media Móvil Simple de 200 días)',
                            tecnico: 'La media aritmética de los precios de cierre de los últimos 200 días de negociación. Suaviza la volatilidad diaria y muestra la tendencia de fondo del activo.',
                            sencillo: 'Es como calcular la nota media de un alumno en todo el curso. Si un día saca un 3 pero su media es 8, sabes que probablemente fue un mal día, no que sea mal estudiante.',
                        },
                        {
                            termino: 'SMA 200W (Media Móvil de 200 semanas)',
                            tecnico: 'Similar a la SMA 200, pero calculada con los cierres semanales de los últimos 200 semanas (~4 años). Es un indicador de tendencia de larguísimo plazo.',
                            sencillo: 'Lo mismo que la SMA 200, pero mirando las notas semanales de casi 4 años. Si el precio toca esta línea, es algo que pasa muy pocas veces en la vida de una empresa.',
                        },
                        {
                            termino: 'ATH (All-Time High / Máximo Histórico)',
                            tecnico: 'El precio más alto jamás alcanzado por el activo en todo su historial de cotización.',
                            sencillo: 'El récord personal de la acción. Si una acción valió 200€ una vez y ahora vale 150€, ha caído un 25% desde su récord.',
                        },
                        {
                            termino: 'Desviación respecto a la SMA',
                            tecnico: 'La diferencia porcentual entre el precio actual y la SMA. Una desviación de -20% indica que el precio está un 20% por debajo de su media.',
                            sencillo: 'Cuánto se ha alejado el precio de su «nivel normal». Si es muy negativo (por ejemplo -20%), significa que el precio está mucho más bajo de lo que suele estar.',
                        },
                        {
                            termino: 'Tramo',
                            tecnico: 'Cada uno de los niveles de entrada en la Estrategia B, definidos por el porcentaje de caída desde ATH. Tramo 1 = -30%, Tramo 2 = -50%, Tramo 3 = -65%.',
                            sencillo: 'Es como los niveles de descuento en una tienda. Tramo 1 = rebajas, Tramo 2 = liquidación, Tramo 3 = están prácticamente regalando.',
                        },
                        {
                            termino: 'Mean Reversion (Reversión a la media)',
                            tecnico: 'Principio estadístico que establece que los precios tienden a volver a su media histórica tras desviaciones extremas.',
                            sencillo: 'Una empresa que normalmente vale 100€ y cae a 60€ por un susto del mercado, tiende con el tiempo a volver cerca de los 100€. No siempre pasa, pero es lo que dicen las estadísticas a largo plazo.',
                        },
                        {
                            termino: 'Obsolescencia estructural',
                            tecnico: 'Cuando la caída de una empresa se debe a un cambio fundamental en su modelo de negocio, no a condiciones temporales de mercado. Ejemplo: Kodak cuando apareció la fotografía digital.',
                            sencillo: 'A veces una empresa no cae por un susto temporal, sino porque su negocio está muriendo de verdad. En ese caso, NO deberías comprar. Es como comprar máquinas de fax en 2025: el producto ya no tiene futuro.',
                        },
                    ].map((item, i) => (
                        <div key={i} className="strategy-rules" style={{ marginBottom: 0 }}>
                            <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, fontSize: '0.9rem' }}>
                                {item.termino}
                            </p>
                            <p style={{ marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid var(--accent-purple)' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', fontWeight: 600, display: 'block', marginBottom: 4 }}>TÉCNICO</span>
                                {item.tecnico}
                            </p>
                            <p style={{ paddingLeft: 12, borderLeft: '2px solid var(--accent-cyan)' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600, display: 'block', marginBottom: 4 }}>EN SIMPLE</span>
                                {item.sencillo}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Sección 4: Cómo usar el dashboard ──────── */}
            <div className="form-container" style={{ marginBottom: 20 }}>
                <h3 className="form-title">🖥️ Cómo usar esta webapp paso a paso</h3>

                <div className="strategy-rules" style={{ marginBottom: 16 }}>
                    <ol style={{ paddingLeft: 24 }}>
                        <li style={{ marginBottom: 16 }}>
                            <strong style={{ color: 'var(--accent-cyan)' }}>Panel General</strong>
                            <p style={{ marginTop: 4 }}>
                                Aquí ves todos los activos de un vistazo. La tabla muestra el precio actual, cuánto ha caído cada empresa
                                desde su máximo histórico (% Caída ATH), y si alguna está en zona de compra. Fíjate en la columna <strong>«Acción»</strong>:
                                si dice <span style={{ color: 'var(--accent-green)' }}>🟢 COMPRAR</span>, la empresa ha entrado en zona de descuento según las reglas matemáticas.
                            </p>
                        </li>
                        <li style={{ marginBottom: 16 }}>
                            <strong style={{ color: 'var(--accent-cyan)' }}>Cazador de Pánico</strong>
                            <p style={{ marginTop: 4 }}>
                                Aquí ves solo las 5 empresas de la Estrategia A. Busca las que tengan una desviación de SMA 200 <strong>menor a -20%</strong>.
                                Eso significa que están significativamente por debajo de su precio normal. Si aparece una alerta aquí, es el momento de considerar la compra.
                            </p>
                        </li>
                        <li style={{ marginBottom: 16 }}>
                            <strong style={{ color: 'var(--accent-purple)' }}>Bóveda Chandler</strong>
                            <p style={{ marginTop: 4 }}>
                                Aquí ves las 9 empresas de la Estrategia B. Fíjate en la columna <strong>«Tramo»</strong>.
                                Si alguna empresa marca T1, T2 o T3, significa que ha caído lo suficiente como para activar un tramo de compra.
                                Cuanto mayor sea el tramo, mayor es el descuento (y mayor podría ser la oportunidad).
                            </p>
                        </li>
                        <li style={{ marginBottom: 16 }}>
                            <strong style={{ color: 'var(--accent-orange)' }}>Mi Portfolio</strong>
                            <p style={{ marginTop: 4 }}>
                                Cada vez que compres acciones, regístralas aquí. El sistema calculará automáticamente cuánto has ganado o perdido
                                desde la fecha de compra. Así llevas un control profesional sin necesidad de hojas de cálculo.
                            </p>
                        </li>
                        <li>
                            <strong style={{ color: 'var(--accent-red)' }}>Alertas</strong>
                            <p style={{ marginTop: 4 }}>
                                En la parte superior del dashboard aparecen <strong>banners de alerta</strong> cuando alguna empresa entra en zona de compra.
                                No necesitas mirar la tabla todo el rato; las alertas te avisan automáticamente.
                                Puedes cerrarlas con la ✕ pero el análisis seguirá vigente.
                            </p>
                        </li>
                    </ol>
                </div>
            </div>

            {/* ── Sección 5: Importante ─────────────────── */}
            <div className="form-container" style={{ marginBottom: 20 }}>
                <h3 className="form-title">⚠️ Lo que debes saber antes de invertir</h3>

                <div className="strategy-rules" style={{ background: 'rgba(239, 68, 68, 0.06)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                    <ul style={{ paddingLeft: 20 }}>
                        <li style={{ marginBottom: 12 }}>
                            <strong>Este sistema NO predice el futuro.</strong> Nadie puede. Lo que hace es detectar situaciones estadísticamente inusuales
                            que históricamente se han recuperado. Pero «históricamente» no garantiza «siempre».
                        </li>
                        <li style={{ marginBottom: 12 }}>
                            <strong>Solo vigila empresas líderes mundiales.</strong> Estas reglas no sirven para empresas pequeñas, nuevas, o de sectores inestables.
                            Una buena rebaja en Apple es algo muy diferente de una buena rebaja en una startup desconocida.
                        </li>
                        <li style={{ marginBottom: 12 }}>
                            <strong>Invierte solo dinero que no necesites.</strong> Nunca inviertas el dinero del alquiler, la comida, o una emergencia.
                            La inversión es para dinero que puedes permitirte dejar quieto durante <strong>meses o años</strong>.
                        </li>
                        <li style={{ marginBottom: 12 }}>
                            <strong>Cuidado con la obsolescencia estructural.</strong> Si una empresa cae porque su negocio se está quedando obsoleto
                            (ejemplo: taxis antes de Uber, alquiler de DVD antes de Netflix), las reglas no aplican.
                            Puedes marcar un activo como «obsolescencia estructural» para desactivar sus alertas.
                        </li>
                        <li style={{ marginBottom: 12 }}>
                            <strong>Diversifica.</strong> Nunca pongas todo tu capital en una sola empresa. Reparte entre varias y entre ambas estrategias.
                        </li>
                        <li>
                            <strong>Ten paciencia.</strong> La Estrategia B (Bóveda Chandler) está diseñada para 2-5 años. Si compras hoy, puede que pases meses
                            en negativo antes de ver ganancias. Eso es <em>normal</em> y parte del plan.
                        </li>
                    </ul>
                </div>
            </div>

            {/* ── Sección 6: Datos técnicos ─────────────── */}
            <div className="form-container" style={{ marginBottom: 20 }}>
                <h3 className="form-title">🔧 Datos técnicos del sistema</h3>

                <div className="strategy-rules">
                    <ul style={{ paddingLeft: 20 }}>
                        <li style={{ marginBottom: 8 }}>
                            <strong>Fuente de datos:</strong> Yahoo Finance (endpoint público). Los datos se actualizan automáticamente cada 15 minutos. El precio que ves es el del último cierre o de la sesión actual si el mercado está abierto.
                        </li>
                        <li style={{ marginBottom: 8 }}>
                            <strong>Almacenamiento:</strong> Tus compras se guardan en el <strong>almacenamiento local</strong> de tu navegador (localStorage).
                            Esto significa que tus datos están <em>solo en este dispositivo y navegador</em>. Si borras los datos del navegador, se perderán.
                        </li>
                        <li style={{ marginBottom: 8 }}>
                            <strong>SMA 200 diaria:</strong> Calculada con los últimos 200 días de cotización (~10 meses laborables).
                        </li>
                        <li style={{ marginBottom: 8 }}>
                            <strong>SMA 200 semanal:</strong> Calculada con los últimos 200 cierres semanales (~4 años).
                        </li>
                        <li style={{ marginBottom: 8 }}>
                            <strong>ATH:</strong> El máximo precio de cierre semanal en todo el historial disponible del activo.
                        </li>
                        <li>
                            <strong>MC.PA (LVMH):</strong> Cotiza en la bolsa de París (Euronext), por lo que su precio se muestra en euros (€) y su horario es el europeo.
                        </li>
                    </ul>
                </div>
            </div>

            {/* ── Sección 7: Filosofía ──────────────────── */}
            <div className="form-container">
                <h3 className="form-title">🧠 Filosofía del sistema</h3>

                <div className="strategy-rules" style={{ background: 'rgba(0, 212, 255, 0.04)', borderColor: 'rgba(0, 212, 255, 0.15)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                        <div>
                            <p style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 8 }}>Claridad {'>'} Complejidad</p>
                            <p style={{ fontSize: '0.8rem' }}>
                                Si no entiendes por qué compras, no compres. Cada señal tiene una explicación matemática clara.
                            </p>
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 8 }}>Reglas {'>'} Emociones</p>
                            <p style={{ fontSize: '0.8rem' }}>
                                El miedo y la euforia son los peores consejeros. Este sistema reemplaza emociones por reglas objetivas.
                            </p>
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 8 }}>Acompaña {'>'} Decide</p>
                            <p style={{ fontSize: '0.8rem' }}>
                                El sistema te informa y sugiere, pero <strong>tú</strong> tomas la decisión final. Siempre.
                            </p>
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 8 }}>Paciencia {'>'} Velocidad</p>
                            <p style={{ fontSize: '0.8rem' }}>
                                Esto no es trading. No compras y vendes cada día. Compras cuando los demás entran en pánico, y esperas con calma.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', padding: '24px 0 8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <p>«El mercado es un dispositivo para transferir dinero del impaciente al paciente.»</p>
                    <p style={{ marginTop: 4, fontWeight: 600 }}>— Warren Buffett</p>
                </div>
            </div>
        </div>
    );
}
