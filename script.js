const STORAGE_KEY = "hidrata_plus_registros";
const THEME_KEY = "hidrata_plus_tema";
const ML_PER_KG = 35;

let records = loadRecords();
let editingId = null;

const splash = document.getElementById("splash");
const home = document.getElementById("home");

const enterBtn = document.getElementById("enterBtn");

const themeToggle =
    document.getElementById("themeToggle");

const headerThemeToggle =
    document.getElementById("headerThemeToggle");

const addBtn =
    document.getElementById("addBtn");

const emptyAddBtn =
    document.getElementById("emptyAddBtn");

const recordsList =
    document.getElementById("recordsList");

const emptyState =
    document.getElementById("emptyState");

const totalToday =
    document.getElementById("totalToday");

const dailyGoal =
    document.getElementById("dailyGoal");

const goalPercent =
    document.getElementById("goalPercent");

const modalOverlay =
    document.getElementById("modalOverlay");

const modalTitle =
    document.getElementById("modalTitle");

const closeModal =
    document.getElementById("closeModal");

const cancelBtn =
    document.getElementById("cancelBtn");

const waterForm =
    document.getElementById("waterForm");

const dateInput =
    document.getElementById("date");

const quantityInput =
    document.getElementById("quantity");

const weightInput =
    document.getElementById("weight");

const goalPreview =
    document.getElementById("goalPreview");

const toast =
    document.getElementById("toast");

applySavedTheme();
render();

enterBtn.addEventListener("click", () => {

    splash.classList.add("hidden");

    home.classList.remove("hidden");

    render();

});

themeToggle.addEventListener(
    "click",
    toggleTheme
);

headerThemeToggle.addEventListener(
    "click",
    toggleTheme
);

addBtn.addEventListener(
    "click",
    () => openModal()
);

emptyAddBtn.addEventListener(
    "click",
    () => openModal()
);

closeModal.addEventListener(
    "click",
    closeModalWindow
);

cancelBtn.addEventListener(
    "click",
    closeModalWindow
);

modalOverlay.addEventListener(
    "click",
    (event) => {

        if (event.target === modalOverlay) {
            closeModalWindow();
        }

    }
);

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            !modalOverlay.classList.contains("hidden")
        ) {

            closeModalWindow();

        }

    }
);

quantityInput.addEventListener(
    "input",
    updateGoalPreview
);

weightInput.addEventListener(
    "input",
    updateGoalPreview
);

waterForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        const date = dateInput.value;

        const quantity =
            Number(quantityInput.value);

        const weight =
            Number(weightInput.value);

        if (
            !date ||
            quantity <= 0 ||
            weight <= 0
        ) {

            showToast(
                "Preencha os dados corretamente."
            );

            return;
        }

        if (editingId !== null) {

            const index =
                records.findIndex(
                    record =>
                        record.id === editingId
                );

            if (index !== -1) {

                records[index] = {

                    ...records[index],

                    data: date,

                    quantidade_em_ml:
                        quantity,

                    peso_atual_kg:
                        weight

                };

            }

            showToast(
                "Registro atualizado!"
            );

        } else {

            records.push({

                id:
                    crypto.randomUUID
                        ? crypto.randomUUID()
                        : String(Date.now()),

                data: date,

                quantidade_em_ml:
                    quantity,

                peso_atual_kg:
                    weight

            });

            showToast(
                "Consumo adicionado!"
            );

        }

        saveRecords();

        closeModalWindow();

        render();

    }
);

function loadRecords() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    STORAGE_KEY
                )
            );

        return Array.isArray(saved)
            ? saved
            : [];

    } catch {

        return [];

    }

}

function saveRecords() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(records)
    );

}

function getTodayString() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}

function getTodayRecords() {

    return records.filter(
        record =>
            record.data ===
            getTodayString()
    );

}

function calculateTodayData() {

    const todayRecords =
        getTodayRecords();

    const total =
        todayRecords.reduce(
            (sum, record) =>
                sum +
                Number(
                    record.quantidade_em_ml || 0
                ),
            0
        );

    const latestRecord =
        todayRecords[
            todayRecords.length - 1
        ] ||
        [...records].sort(
            (a, b) =>
                b.data.localeCompare(a.data)
        )[0];

    const weight =
        latestRecord
            ? Number(
                latestRecord.peso_atual_kg || 0
            )
            : 0;

    const goal =
        weight * ML_PER_KG;

    const percent =
        goal > 0
            ? (total / goal) * 100
            : 0;

    return {
        total,
        weight,
        goal,
        percent
    };

}

function render() {

    const {
        total,
        goal,
        percent
    } = calculateTodayData();

    totalToday.textContent =
        `${formatNumber(total)} ml`;

    dailyGoal.textContent =
        goal > 0
            ? `${formatNumber(goal)} ml`
            : "0 ml";

    goalPercent.textContent =
        `${Math.round(percent)}%`;

    renderRecords();

}

function renderRecords() {

    recordsList.innerHTML = "";

    if (records.length === 0) {

        emptyState.classList.remove(
            "hidden"
        );

        return;
    }

    emptyState.classList.add(
        "hidden"
    );

    const sortedRecords =
        [...records].sort(
            (a, b) =>
                b.data.localeCompare(a.data)
        );

    sortedRecords.forEach(
        record => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "record-card";

            const date =
                formatDate(record.data);

            const amount =
                Number(
                    record.quantidade_em_ml || 0
                );

            const weight =
                Number(
                    record.peso_atual_kg || 0
                );

            const goal =
                weight * ML_PER_KG;

            card.innerHTML = `

                <div class="record-main">

                    <div class="record-date">
                        ${date}
                    </div>

                    <div class="record-info">

                        Peso:
                        ${formatNumber(weight)}
                        kg

                        ·

                        Meta:
                        ${formatNumber(goal)}
                        ml

                    </div>

                </div>

                <div class="record-amount">

                    ${formatNumber(amount)}
                    ml

                </div>

                <button
                    class="delete-btn"
                    type="button"
                >
                    🗑️
                </button>

            `;

            card.addEventListener(
                "click",
                event => {

                    if (
                        !event.target.closest(
                            ".delete-btn"
                        )
                    ) {

                        openModal(record);

                    }

                }
            );

            card
                .querySelector(".delete-btn")
                .addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        deleteRecord(
                            record.id
                        );

                    }
                );

            recordsList.appendChild(card);

        }
    );

}

function openModal(record = null) {

    editingId =
        record
            ? record.id
            : null;

    modalTitle.textContent =
        record
            ? "Editar consumo"
            : "Adicionar consumo";

    dateInput.value =
        record
            ? record.data
            : getTodayString();

    quantityInput.value =
        record
            ? record.quantidade_em_ml
            : "";

    weightInput.value =
        record
            ? record.peso_atual_kg
            : "";

    updateGoalPreview();

    modalOverlay.classList.remove(
        "hidden"
    );

    setTimeout(
        () => quantityInput.focus(),
        50
    );

}

function closeModalWindow() {

    modalOverlay.classList.add(
        "hidden"
    );

    editingId = null;

    waterForm.reset();

    dateInput.value =
        getTodayString();

    goalPreview.textContent =
        "0 ml/dia";

}

function deleteRecord(id) {

    const confirmed =
        confirm(
            "Deseja excluir este registro?"
        );

    if (!confirmed) {
        return;
    }

    records =
        records.filter(
            record =>
                record.id !== id
        );

    saveRecords();

    render();

    showToast(
        "Registro excluído."
    );

}

function updateGoalPreview() {

    const weight =
        Number(weightInput.value);

    if (weight > 0) {

        const goal =
            weight * ML_PER_KG;

        goalPreview.textContent =
            `${formatNumber(goal)} ml/dia`;

    } else {

        goalPreview.textContent =
            "0 ml/dia";

    }

}

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const [
        year,
        month,
        day
    ] = dateString.split("-");

    return `${day}/${month}/${year}`;

}

function formatNumber(value) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            maximumFractionDigits: 2
        }
    ).format(value);

}

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );

    const dark =
        document.body.classList.contains(
            "dark"
        );

    localStorage.setItem(
        THEME_KEY,
        dark
            ? "dark"
            : "light"
    );

    updateThemeButtons();

}

function applySavedTheme() {

    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        );

    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark"
        );

    }

    updateThemeButtons();

}

function updateThemeButtons() {

    const dark =
        document.body.classList.contains(
            "dark"
        );

    const icon =
        dark
            ? "☀️"
            : "🌙";

    themeToggle.textContent =
        icon;

    headerThemeToggle.textContent =
        icon;

}

function showToast(message) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        showToast.timer
    );

    showToast.timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}