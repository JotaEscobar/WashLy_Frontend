import QRCode from 'qrcode';

export const printTicket = async (ticketData, empresaData = null) => {
    // Si no tenemos empresaData global, asume un layout básico, aunque idealmente debería venir del Store o Backend.
    const empresaNombre = empresaData?.nombre || 'LAVANDERÍA SUPER CLEAN';
    const empresaRuc = empresaData?.ruc || '20601234567';
    const empresaDireccion = empresaData?.direccion_fiscal || 'Av. Principal 123';
    const empresaTelefono = empresaData?.telefono_contacto || '';
    const prefijoTicket = empresaData?.ticket_prefijo || 'TK-';
    const mensajePie = empresaData?.ticket_mensaje_pie || '¡Gracias por su preferencia!\nConserve este ticket para el recojo.';
    const logoUrl = typeof empresaData?.ticket_logo === 'string' && empresaData.ticket_logo ? empresaData.ticket_logo : (typeof empresaData?.logo === 'string' ? empresaData.logo : null);
    const serviciosDesc = empresaData?.ticket_servicios_descripcion || '';
    const disclaimer = empresaData?.ticket_disclaimer || '';

    const numero = ticketData.numero_ticket?.startsWith(prefijoTicket) ? ticketData.numero_ticket : `${prefijoTicket}${ticketData.numero_ticket || 'S/N'}`;
    
    // ✅ Generar QR como data URL — no necesita servidor ni auth
    const qrData = `WASHLY|${ticketData.numero_ticket}|${ticketData.id}`;
    let qrDataUrl = '';
    try {
        qrDataUrl = await QRCode.toDataURL(qrData, {
            width: 100,
            margin: 1,
            color: { dark: '#000000', light: '#FFFFFF' }
        });
    } catch (e) {
        console.error('Error generando QR:', e);
    }

    // Verificaciones seguras (algunos DTOs envían cliente.nombres, otros cliente.nombre_completo)
    const clienteNombre = ticketData.cliente?.nombre_completo || ticketData.cliente_info?.nombre_completo || ticketData.cliente_nombre || 'Cliente Genérico';

    // Determinar saldo y estado de pago (En el backend está total y saldo_pendiente)
    const saldo = typeof ticketData.saldo_pendiente === 'number' ? ticketData.saldo_pendiente : 0;
    const total = typeof ticketData.total === 'number' ? ticketData.total : 0;
    const pagado = total - saldo;

    const items = ticketData.items || [];

    const ticketWindow = window.open('', '_blank', 'width=400,height=600');

    const html = `
        <html>
        <head>
            <title>Impresión Ticket #${numero}</title>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body { 
                    font-family: 'Roboto', sans-serif; 
                    font-size: 11px; 
                    margin: 0 auto; 
                    padding: 10px; 
                    width: 80mm; 
                    text-align: center; 
                    color: #000;
                }
                .header { margin-bottom: 12px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                .logo { max-width: 150px; max-height: 100px; margin-bottom: 10px; object-fit: contain; }
                .company-name { font-size: 14px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; }
                .company-info { margin: 2px 0; font-size: 10px; }
                .services-desc { margin: 6px 0; font-size: 10px; font-style: italic; }
                .info { text-align: left; margin-bottom: 10px; font-size: 11px; line-height: 1.4; }
                table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 11px; }
                th { text-align: left; border-bottom: 1px solid #000; font-weight: bold; padding-bottom: 4px; }
                td { padding: 4px 0; vertical-align: top; text-align: left;}
                .text-right { text-align: right; }
                .totals { margin-top: 15px; border-top: 1px dashed #000; padding-top: 5px; }
                .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 5px;}
                .sub-row { display: flex; justify-content: space-between; font-size: 11px; margin-top: 2px; }
                .qr-container { margin-top: 15px; display: flex; flex-direction: column; align-items: center; }
                .qr-container img { width: 100px; height: 100px; }
                .watermark { font-size: 14px; font-weight: bold; border: 2px solid #000; padding: 4px 8px; margin-top: 10px; display: inline-block;}
                .qr-text { font-size: 10px; margin-top: 5px; font-weight: bold; }
                .qr-subtext { font-size: 10px; margin-top: 4px; white-space: pre-wrap; margin-bottom: 10px; }
                .disclaimer { font-family: monospace; font-size: 9px; margin-top: 10px; text-align: justify; text-justify: inter-word; padding-top: 8px; border-top: 1px dashed #000; line-height: 1.5; color: #333; }
                .footer-system { margin-top: 15px; font-size: 9px; color: #555; }
            </style>
        </head>
        <body>
            <div class="header">
                ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="Logo">` : ''}
                <div class="company-name">${empresaNombre}</div>
                ${empresaTelefono ? `<div class="company-info">Cel: ${empresaTelefono}</div>` : ''}
                <div class="company-info">RUC: ${empresaRuc}</div>
                <div class="company-info">${empresaDireccion}</div>
                ${serviciosDesc ? `<div class="services-desc">${serviciosDesc}</div>` : ''}
            </div>
            <div class="info">
                <strong>TICKET: ${numero}</strong><br>
                Cliente: <strong>${clienteNombre}</strong><br>
                Emisión: ${new Date().toLocaleDateString('es-PE')}<br>
                Recojo Est.: <strong>${ticketData.fecha_prometida ? new Date(ticketData.fecha_prometida).toLocaleString('es-PE', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Por confirmar'}</strong>
            </div>
            <table>
                <thead><tr><th>Cant</th><th>Desc</th><th class="text-right">S/</th></tr></thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>${item.cantidad || item.qty}</td>
                            <td>${item.servicio_nombre || item.nombre}</td>
                            <td class="text-right">${parseFloat((item.subtotal || ((item.qty || 1) * item.precio_unitario) || 0)).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="totals">
                <div class="total-row"><span>TOTAL:</span><span>S/ ${total.toFixed(2)}</span></div>
                <div class="sub-row"><span>Pagado:</span><span>S/ ${pagado.toFixed(2)}</span></div>
                <div class="sub-row"><span>Saldo:</span><span>S/ ${saldo.toFixed(2)}</span></div>
            </div>
            ${saldo <= 0 ? '<div class="watermark">¡PAGADO!</div>' : ''}
            <div class="qr-container">
                ${qrDataUrl ? `<img src="${qrDataUrl}" />` : ''}
                <div class="qr-text">Escanear para ver estado</div>
                <div class="qr-subtext">${mensajePie}</div>
            </div>
            ${disclaimer ? `<div class="disclaimer">${disclaimer.replace(/\n/g, '<br>')}</div>` : ''}
            <div class="footer-system">Sistema Washly v1.0</div>
        </body>
        </html>
    `;
    ticketWindow.document.write(html);
    ticketWindow.document.close();
    setTimeout(() => { ticketWindow.focus(); ticketWindow.print(); }, 800);
};
