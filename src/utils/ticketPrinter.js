// utils/ticketPrinter.js

export const printTicket = (ticketData, empresaData = null) => {
    // Si no tenemos empresaData global, asume un layout básico, aunque idealmente debería venir del Store o Backend.
    const empresaNombre = empresaData?.nombre || 'LAVANDERÍA SUPER CLEAN';
    const empresaRuc = empresaData?.ruc || '20601234567';
    const empresaDireccion = empresaData?.direccion_fiscal || 'Av. Principal 123';
    const prefijoTicket = empresaData?.ticket_prefijo || 'TK-';
    const mensajePie = empresaData?.ticket_mensaje_pie || '¡Gracias por su preferencia!\nConserve este ticket para el recojo.';

    const numero = ticketData.numero_ticket?.startsWith(prefijoTicket) ? ticketData.numero_ticket : `${prefijoTicket}${ticketData.numero_ticket || 'S/N'}`;
    const qrUrl = ticketData.qr_code_url || ticketData.qr_code;

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
            <style>
                body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; width: 80mm; text-align: center; }
                .header { margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                .info { text-align: left; margin-bottom: 10px; font-size: 11px; line-height: 1.4; }
                table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 11px; }
                th { text-align: left; border-bottom: 1px solid #000; font-weight: bold; }
                td { padding: 4px 0; vertical-align: top; text-align: left;}
                .text-right { text-align: right; }
                .totals { margin-top: 15px; border-top: 1px dashed #000; padding-top: 5px; }
                .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; margin-top: 5px;}
                .sub-row { display: flex; justify-content: space-between; font-size: 12px; }
                .qr-container { margin-top: 20px; display: flex; flex-direction: column; align-items: center; }
                img { width: 120px; height: 120px; }
                .watermark { font-size: 14px; font-weight: bold; border: 2px solid #000; padding: 5px; margin-top: 10px; display: inline-block;}
                .qr-text { font-size: 10px; margin-top: 5px; font-weight: bold; }
                .qr-subtext { font-size: 10px; margin-top: 2px; white-space: pre-wrap; }
                .footer-system { margin-top: 20px; font-size: 9px; color: #666; border-top: 1px solid #ddd; padding-top: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <strong>${empresaNombre}</strong><br>
                RUC: ${empresaRuc}<br>
                ${empresaDireccion}
            </div>
            <div class="info">
                <strong>TICKET: ${numero}</strong><br>
                Cliente: <strong>${clienteNombre}</strong><br>
                Fecha Recibo: ${new Date().toLocaleDateString()}
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
                ${qrUrl ? `<img src="${qrUrl}" />` : ''}
                <div class="qr-text">Escanear para ver estado</div>
                <div class="qr-subtext">${mensajePie}</div>
            </div>
            <div class="footer-system">Sistema Washly v1.0</div>
        </body>
        </html>
    `;
    ticketWindow.document.write(html);
    ticketWindow.document.close();
    setTimeout(() => { ticketWindow.focus(); ticketWindow.print(); }, 800);
};
