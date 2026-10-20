function escapeHtmlForDrawioValue(html) {
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

const sampleHtml = `<p style="margin:0px;text-align:center;"><b>incidente</b></p><hr size="1"/><p style="margin:0px;margin-left:4px;"><b>[PK]</b> idincidente: SERIAL<br/><b>[UK]</b> codigoincidente: VARCHAR(50)</p><hr size="1"/><p style="margin:0px;margin-left:4px;"><i>[FK]</i> idtipoincidente: INTEGER<br/><i>[FK]</i> id_estado: INTEGER</p><hr size="1"/><p style="margin:0px;margin-left:4px;">fechaincidente: DATE<br/>horaincidente: TIME</p>`;

const escaped = escapeHtmlForDrawioValue(sampleHtml);
console.log('Escaped length:', escaped.length);
console.log('Sample output:');
console.log(escaped.substring(0, 200));
