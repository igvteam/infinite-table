// Synthetic data generators for performance testing

function generateRows(count, columnCount = 6) {
    const columns = []
    for (let c = 0; c < columnCount; c++) {
        columns.push(`Column_${c + 1}`)
    }

    const categories = ['TypeA', 'TypeB', 'TypeC', 'TypeD', 'TypeE']
    const statuses = ['Active', 'Inactive', 'Pending', 'Archived', 'Draft']
    const prefixes = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta']

    const data = new Array(count)
    for (let i = 0; i < count; i++) {
        const row = {}
        row[columns[0]] = `${prefixes[i % prefixes.length]}_${i}`
        row[columns[1]] = categories[i % categories.length]
        row[columns[2]] = statuses[(i * 3) % statuses.length]
        for (let c = 3; c < columnCount; c++) {
            row[columns[c]] = `val_${i}_${c}`
        }
        data[i] = row
    }

    return { columns, data }
}

// ENCODE-like data generator
function generateEncodeData(count = 2000) {
    const columns = ['ID', 'AssayType', 'Target', 'Biosample', 'OutputType', 'Lab', 'HREF']
    const assayTypes = ['ChIP-seq', 'RNA-seq', 'ATAC-seq', 'DNase-seq', 'WGBS', 'Hi-C']
    const targets = ['H3K4me3', 'H3K27ac', 'H3K27me3', 'CTCF', 'POLR2A', 'EP300', 'H3K36me3', 'H3K4me1']
    const biosamples = ['K562', 'HepG2', 'GM12878', 'A549', 'MCF-7', 'HeLa-S3']
    const outputTypes = ['signal', 'peaks', 'alignments', 'fold change']
    const labs = ['Bernstein', 'Snyder', 'Stam', 'Ren', 'Myers']

    const columnDefs = {
        AssayType: { title: 'Assay Type' },
        OutputType: { title: 'Output Type' }
    }

    const data = new Array(count)
    for (let i = 0; i < count; i++) {
        data[i] = {
            ID: `ENCFF${String(i).padStart(6, '0')}`,
            AssayType: assayTypes[i % assayTypes.length],
            Target: targets[i % targets.length],
            Biosample: biosamples[i % biosamples.length],
            OutputType: outputTypes[i % outputTypes.length],
            Lab: labs[i % labs.length],
            HREF: `/files/ENCFF${String(i).padStart(6, '0')}/@@download/ENCFF${String(i).padStart(6, '0')}.bigWig`
        }
    }

    return { columns, columnDefs, data }
}

export { generateRows, generateEncodeData }
