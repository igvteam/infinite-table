/**
 * Small DOM helper utilities.
 */

function createElement(tag, attributes = {}, styles = {}) {
    const el = document.createElement(tag)
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            el.className = value
        } else if (key === 'textContent') {
            el.textContent = value
        } else if (key === 'innerHTML') {
            el.innerHTML = value
        } else {
            el.setAttribute(key, value)
        }
    }
    Object.assign(el.style, styles)
    return el
}

function removeChildren(el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild)
    }
}

function div(className, styles) {
    return createElement('div', className ? { className } : {}, styles || {})
}

export { createElement, removeChildren, div }
