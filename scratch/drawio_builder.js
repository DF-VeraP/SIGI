/**
 * Generador de Diagramas de Flujo Draw.io para SIGI (v2.1)
 * Cumple con el estándar estricto: Sin color (blanco y negro), bordes negros, 
 * texto negro, flechas ortogonales negras, separación por roles y módulos.
 */

const fs = require('fs');
const path = require('path');

function escapeXml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/\n/g, '&#xa;');
}

class DrawioDiagramBuilder {
    constructor() {
        this.tabs = [];
    }

    addTab(id, name) {
        const tab = { id, name, cells: [] };
        // Celda raíz 0 y 1
        tab.cells.push('<mxCell id="0" />');
        tab.cells.push('<mxCell id="1" parent="0" />');
        this.tabs.push(tab);
        return tab;
    }

    // Estilos estándar en Blanco y Negro (B&W) según instrucciones
    static STYLES = {
        START_END: "rounded=1;arcSize=50;whiteSpace=wrap;html=1;strokeColor=#000000;strokeWidth=1.5;fillColor=#ffffff;fontColor=#000000;fontFamily=Helvetica;fontSize=12;fontStyle=1;",
        PROCESS: "whiteSpace=wrap;html=1;strokeColor=#000000;strokeWidth=1;fillColor=#ffffff;fontColor=#000000;fontFamily=Helvetica;fontSize=11;",
        DECISION: "rhombus;whiteSpace=wrap;html=1;strokeColor=#000000;strokeWidth=1;fillColor=#ffffff;fontColor=#000000;fontFamily=Helvetica;fontSize=11;",
        IO_DATA: "shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fixedSize=1;strokeColor=#000000;strokeWidth=1;fillColor=#ffffff;fontColor=#000000;fontFamily=Helvetica;fontSize=11;",
        SUBPROCESS: "shape=process;backgroundOutline=1;whiteSpace=wrap;html=1;strokeColor=#000000;strokeWidth=1;fillColor=#ffffff;fontColor=#000000;fontFamily=Helvetica;fontSize=11;fontStyle=1;",
        CONTAINER: "swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalFlip=0;verticalFlip=0;strokeColor=#000000;strokeWidth=1.5;fillColor=#ffffff;fontColor=#000000;fontFamily=Helvetica;fontSize=13;collapsible=0;",
        EDGE: "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1;endArrow=classic;fontColor=#000000;fontFamily=Helvetica;fontSize=10;"
    };

    addNode(tab, id, value, style, x, y, width, height) {
        const escapedValue = escapeXml(value);
        tab.cells.push(
            `<mxCell id="${id}" value="${escapedValue}" style="${style}" vertex="1" parent="1">` +
            `<mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />` +
            `</mxCell>`
        );
    }

    addEdge(tab, id, sourceId, targetId, label = "", exitPoints = null) {
        const escapedLabel = escapeXml(label);
        let entryExitAttr = "";
        if (exitPoints) {
            if (exitPoints.exitX !== undefined) entryExitAttr += `exitX="${exitPoints.exitX}" `;
            if (exitPoints.exitY !== undefined) entryExitAttr += `exitY="${exitPoints.exitY}" `;
            if (exitPoints.entryX !== undefined) entryExitAttr += `entryX="${exitPoints.entryX}" `;
            if (exitPoints.entryY !== undefined) entryExitAttr += `entryY="${exitPoints.entryY}" `;
        }
        tab.cells.push(
            `<mxCell id="${id}" value="${escapedLabel}" style="${DrawioDiagramBuilder.STYLES.EDGE}" edge="1" parent="1" source="${sourceId}" target="${targetId}">` +
            `<mxGeometry relative="1" as="geometry" ${entryExitAttr}/>` +
            `</mxCell>`
        );
    }

    toXml() {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="SIGI-Architecture-Generator" version="22.0.0" pages="${this.tabs.length}">\n`;
        
        for (const tab of this.tabs) {
            xml += `  <diagram id="${tab.id}" name="${escapeXml(tab.name)}">\n`;
            xml += `    <mxGraphModel dx="1600" dy="1200" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2400" pageHeight="2600" math="0" shadow="0">\n`;
            xml += `      <root>\n`;
            for (const cell of tab.cells) {
                xml += `        ${cell}\n`;
            }
            xml += `      </root>\n`;
            xml += `    </mxGraphModel>\n`;
            xml += `  </diagram>\n`;
        }
        xml += `</mxfile>\n`;
        return xml;
    }
}

// Exportar para construcción de las pestañas
module.exports = { DrawioDiagramBuilder };
