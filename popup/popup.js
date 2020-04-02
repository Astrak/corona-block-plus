const IDEAS = [
    "twerking",
    "pokemons",
    "witchcraft",
    "Skynet",
    "kind of",
    "infidels",
    "intercourse",
    "wind",
    "bigotry",
    "good vibes",
];

populatePropositions();

setUpPopup();

shareValueWithBrowser();

function populatePropositions() {
    const appChoices = document.getElementById("app-choices");
    const input = document.getElementById("replace-input");
    for (const idea of IDEAS) {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.innerHTML = idea;
        button.onclick = () => (input.value = idea);
        li.appendChild(button);
        appChoices.appendChild(li);
    }
}

function setUpPopup() {
    chrome.storage.sync.get(["cbp-enabled", "cbp-replacement"], storage => {
        const input = document.getElementById("replace-input");
        const value = storage["cbp-replacement"];
        if (value) {
            input.value = value;
        }

        const checkbox = document.getElementById("checkbox");
        checkbox.checked = storage["cbp-enabled"] !== false ? true : false;

        const button = document.getElementById("apply");
        button.disabled = !checkbox.checked;

        checkbox.addEventListener("change", () => {
            chrome.storage.sync.set({ "cbp-enabled": checkbox.checked });
            button.disabled = !checkbox.checked;
        });
    });
}

let isScriptSetup = false;
function shareValueWithBrowser() {
    const button = document.getElementById("apply");
    const input = document.getElementById("replace-input");

    button.addEventListener("click", () => {
        chrome.storage.sync.set(
            { "cbp-replacement": input.value, "cbp-enabled": true },
            () => {
                console.log("saved " + input.value);
            }
        );
    });
}
