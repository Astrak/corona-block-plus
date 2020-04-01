const IDEAS = [
    "twerking",
    "pokemons",
    "witchcraft",
    "Skynet",
    "sort of",
    "infidels",
    "copulation",
    "love",
];

checkInitStorage();

populatePropositions();

setUpCheckbox();

shareValueWithBrowser();

function checkInitStorage() {
    chrome.storage.sync.get(["cbp-replacement", "cbp-enabled"], storage => {
        if (!storage["cbp-enabled"]) {
            chrome.storage.sync.set({
                "cbp-enabled": true,
                "cbp-replacement": "love",
            });
        }
    });
}

function populatePropositions() {
    const appChoices = document.getElementById("app-choices");
    const input = document.getElementById("replace-covid-input");
    if (appChoices && input) {
        for (const idea of IDEAS) {
            const li = document.createElement("li");
            const button = document.createElement("button");
            button.innerHTML = idea;
            button.onclick = () => (input.value = idea);
            li.appendChild(button);
            appChoices.appendChild(li);
        }
    }
}

function setUpCheckbox() {
    const checkbox = document.getElementById("checkbox");
    if (!checkbox) return;
    chrome.storage.sync.get(["cbp-enabled"], storage => {
        checkbox.checked = storage["cbp-enabled"];
        const button = document.getElementById("decontaminate");
        if (!button) return;
        button.disabled = !checkbox.checked;
    });
    checkbox.addEventListener("change", e => {
        chrome.storage.sync.set({ "cbp-enabled": checkbox.checked });
        const button = document.getElementById("decontaminate");
        if (!button) return;
        button.disabled = !e.target.checked;
    });
}

let isScriptSetup = false;
function shareValueWithBrowser() {
    const button = document.getElementById("decontaminate");
    const input = document.getElementById("replace-covid-input");

    if (button && input) {
        button.addEventListener("click", () => {
            chrome.storage.sync.set({ "cbp-replacement": input.value }, () => {
                console.log("saved " + input.value);
            });
        });
    }
}
