// Avoid duplicate insertions: only replace "corona" or "virus" strings
// after "corona virus" strings are replaced => put one word strings at
// the end of the list.
var TARGET_STRINGS = [
    "corona virus",
    "covid-19 virus",
    "covid virus",
    "corona-virus",
    "covid-19",
    "Covid-19",
    "COVID-19",
    "coronavirus",
    "Coronavirus",
    "covid",
    "Covid",
    "COVID",
    "virus",
    "Virus",
    "corona",
    "Corona",
];

replaceCorona();

function replaceCorona() {
    chrome.storage.sync.get(["cbp-replacement", "cbp-enabled"], storage => {
        const isEnabled = storage["cbp-enabled"];
        if (isEnabled === undefined) {
            return;
        }
        const replacement = storage["cbp-replacement"];
        if (
            isEnabled &&
            replacement.trim() !== "" &&
            TARGET_STRINGS.indexOf(replacement) === -1
        ) {
            traverseAndObserveDocument(replacement);
            TARGET_STRINGS.push(replacement);
        }
        chrome.storage.onChanged.addListener(changes => {
            for (key in changes) {
                if (key === "cbp-replacement" || !isEnabled) {
                    return replaceCorona();
                }
            }
        });
    });
}

function walk(rootNode, value) {
    // Find all the text nodes in rootNode
    const walker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    let node;

    // Modify each text node's value
    while ((node = walker.nextNode())) {
        handleText(node, value);
    }
}

function handleText(textNode, value) {
    textNode.nodeValue = replaceText(textNode.nodeValue, value);
}

function replaceText(v, value) {
    TARGET_STRINGS.forEach(targetString => {
        v = v.replace(new RegExp(targetString, "g"), value);
    });
    return v;
}

// Returns true if a node should *not* be altered in any way
function isForbiddenNode(node) {
    return (
        node.isContentEditable || // DraftJS and many others
        (node.parentNode && node.parentNode.isContentEditable) || // Special case for Gmail
        (node.tagName &&
            (node.tagName.toLowerCase() == "textarea" || // Some catch-alls
                node.tagName.toLowerCase() == "input"))
    );
}

function traverseAndObserveDocument(value) {
    document.title = replaceText(document.title, value);
    walk(document.body, value);

    window.addEventListener("message", e => {
        if (e.data.type === "REPLACE_COVID") {
            window.__replacementStringCovid = e.data.value;
            document.title = replaceText(document.title, value);
            walk(document.body, value);
        }
    });

    const title = document.getElementsByTagName("title")[0];
    const observer = mutations => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (isForbiddenNode(node)) {
                    // Should never operate on user-editable content
                    continue;
                } else if (node.nodeType === 3) {
                    // Replace the text for text nodes
                    handleText(node, value);
                } else {
                    // Otherwise, find text nodes within the given node and replace text
                    walk(node, value);
                }
            }
        }
    };

    const observerConfig = {
        characterData: true,
        childList: true,
        subtree: true,
    };
    const bodyObserver = new MutationObserver(observer);
    const titleObserver = new MutationObserver(observer);

    bodyObserver.observe(document.body, observerConfig);
    if (title) {
        titleObserver.observe(title, observerConfig);
    }
}
