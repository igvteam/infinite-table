// Small static datasets for testing

const sampleColumns = ['Name', 'Category', 'Value', 'Status']

const sampleData = [
    { Name: 'Alpha', Category: 'A', Value: '100', Status: 'Active' },
    { Name: 'Beta', Category: 'B', Value: '200', Status: 'Inactive' },
    { Name: 'Gamma', Category: 'A', Value: '150', Status: 'Active' },
    { Name: 'Delta', Category: 'C', Value: '300', Status: 'Pending' },
    { Name: 'Epsilon', Category: 'B', Value: '250', Status: 'Active' },
    { Name: 'Zeta', Category: 'A', Value: '175', Status: 'Inactive' },
    { Name: 'Eta', Category: 'C', Value: '125', Status: 'Active' },
    { Name: 'Theta', Category: 'B', Value: '350', Status: 'Pending' },
    { Name: 'Iota', Category: 'A', Value: '400', Status: 'Active' },
    { Name: 'Kappa', Category: 'C', Value: '275', Status: 'Inactive' }
]

// 50-row dataset
const sample50 = []
const categories = ['Genomics', 'Proteomics', 'Transcriptomics', 'Epigenomics', 'Metabolomics']
const statuses = ['Active', 'Inactive', 'Pending', 'Archived']
for (let i = 0; i < 50; i++) {
    sample50.push({
        Name: `Sample_${String(i + 1).padStart(3, '0')}`,
        Category: categories[i % categories.length],
        Value: String(Math.floor(Math.random() * 1000)),
        Status: statuses[i % statuses.length]
    })
}

export { sampleColumns, sampleData, sample50 }
