export type Reaction = {
    nome: string,
    tipo: string,
    reagentes: string[],
    produtos: string[],
    equacao: string,
    embedded_link: string,
    instrucoes: string
};

export const REACTION_URL_PARAMETER = 'reação';

export function isDigit(str: string) {
    return str.length === 1 && str >= '0' && str <= '9';
}

export function removeAccents(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function removeParentheses(str: string) {
    str = str.replace(/\s*\([^)]*\)\s*/g, ' ');

    str = str.replace(/\s+/g, ' ');

    str = str.trim();

    return str;
};

export function interpolate(template: string, data: { [key: string]: string }) {
    return template.replace(/{{\s*(.*?)\s*}}/g, (_, key) => {
        key = removeAccents(key.trim()).toLowerCase();
        return data[key] !== undefined ? data[key] : '';
    });
}

export function convertText(input: string) {
    const lines = input.split('\n');

    let html = '';
    const listStack: {type: 'ul'|'ol', indent: number, openLi: boolean}[] = [];

    // Close lists with indentation strictly greater than targetIndent
    function closeLists(targetIndent: number) {
        while (listStack.length > 0 && listStack[listStack.length - 1].indent > targetIndent) {
            const list = listStack.pop()!;
            // Close the last <li> if still open
            if (list.openLi) {
                html += '</li>';
                list.openLi = false;
            }
            html += list.type === 'ul' ? '</ul>' : '</ol>';
        }
    }

    lines.forEach(line => {
        if (!line.trim()) {
            closeLists(-1); // Close all lists on empty line
            return;
        }

        const indentMatch = line.match(/^(\t*)/);
        const indentLevel = indentMatch ? indentMatch[1].length : 0;

        const content = line.trim();

        const ulMatch = content.match(/^-\s+(.*)/);
        const olMatch = content.match(/^(\d+)\)\s?(.*)/);

        if (ulMatch) {
            const itemText = ulMatch[1];

            // Close lists deeper than current indent
            closeLists(indentLevel);

            // Check if we need to open a new ul
            if (
                listStack.length === 0 ||
                listStack[listStack.length - 1].indent < indentLevel ||
                listStack[listStack.length - 1].type !== 'ul'
            ) {
                // Before opening a new list, close the previous <li> if open at the current level
                if (listStack.length > 0) {
                    const currentList = listStack[listStack.length - 1];
                    if (currentList.openLi) {
                        html += '<ul>';
                        // We don't close the <li> here, because nested list goes inside it
                    } else {
                        html += '<ul>';
                    }
                } else {
                    html += '<ul>';
                }
                listStack.push({ type: 'ul', indent: indentLevel, openLi: false });
            } else {
                // Close previous <li> in the same list if open
                const currentList = listStack[listStack.length - 1];
                if (currentList.openLi) {
                    html += '</li>';
                    currentList.openLi = false;
                }
            }

            // Open new <li>
            html += `<li>${itemText}`;
            listStack[listStack.length - 1].openLi = true;
        }
        else if (olMatch) {
            const itemText = olMatch[2];

            // Close lists deeper than current indent
            closeLists(indentLevel);

            // Check if we need to open a new ol
            if (
                listStack.length === 0 ||
                listStack[listStack.length - 1].indent < indentLevel ||
                listStack[listStack.length - 1].type !== 'ol'
            ) {
                if (listStack.length > 0) {
                    const currentList = listStack[listStack.length - 1];
                    if (currentList.openLi) {
                        html += '<ol>';
                    } else {
                        html += '<ol>';
                    }
                } else {
                    html += '<ol>';
                }
                listStack.push({ type: 'ol', indent: indentLevel, openLi: false });
            } else {
                // Close previous <li> in the same list if open
                const currentList = listStack[listStack.length - 1];
                if (currentList.openLi) {
                    html += '</li>';
                    currentList.openLi = false;
                }
            }

            // Open new <li>
            html += `<li>${itemText}`;
            listStack[listStack.length - 1].openLi = true;
        }
        else {
            // Close all lists on normal text lines
            closeLists(-1);
            html += `<p>${content}</p>`;
        }
    });

    // Close any remaining open lists and <li>
    closeLists(-1);

    return html;
}

export function insertTextAtCursor(input: HTMLInputElement, text: string) {
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const value = input.value;

    input.value = value.substring(0, start) + text + value.substring(end);

    const newCursorPos = start + text.length;
    input.selectionStart = input.selectionEnd = newCursorPos;

    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
}