/* =====================================================
   CASHFLOW STORE
   ===================================================== */

const KEY = "cashflow_store_v3";


/* =====================================================
   DEFAULT KEDAI
   ===================================================== */

const DEFAULT_OUTLETS = [
    {
        id: 1,
        name: "Kedai 1"
    },
    {
        id: 2,
        name: "Kedai 2"
    },
    {
        id: 3,
        name: "Kedai 3"
    },
    {
        id: 4,
        name: "Kedai 4"
    },
    {
        id: 5,
        name: "Kedai 5"
    },
    {
        id: 6,
        name: "Kedai 6"
    }
];


/* =====================================================
   DATABASE LOCAL
   ===================================================== */

let db =
    JSON.parse(
        localStorage.getItem(KEY) || "null"
    ) || {
        outlets: DEFAULT_OUTLETS,
        shifts: [],
        receipts: []
    };


/*
   Kalau database lama belum punya outlets
*/
if (
    !Array.isArray(db.outlets) ||
    db.outlets.length === 0
) {
    db.outlets = DEFAULT_OUTLETS;
}


/* =====================================================
   STATE
   ===================================================== */

let currentShift = "Pagi";

let receiptType = "Outlet";

let editingOutletId = null;


/* =====================================================
   SHORTCUT
   ===================================================== */

const $ = id =>
    document.getElementById(id);


/* =====================================================
   DATE
   ===================================================== */

function today() {

    return new Date()
        .toISOString()
        .slice(0, 10);

}


/* =====================================================
   SAVE DATABASE
   ===================================================== */

function saveDB() {

    localStorage.setItem(
        KEY,
        JSON.stringify(db)
    );

}


/* =====================================================
   MONEY
   ===================================================== */

function money(number) {

    return (
        "RM " +
        Number(number || 0)
            .toLocaleString(
                "ms-MY",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )
    );

}


/* =====================================================
   NUMBER INPUT
   ===================================================== */

function val(id) {

    return (
        parseFloat(
            String(
                $(id).value || ""
            ).replace(/,/g, "")
        ) || 0
    );

}


/* =====================================================
   SHIFT CALCULATION
   ===================================================== */

/*
   Deposit +
   Bank In -
   Voucher -

   CASH =
   Deposit - Bank In - Voucher
*/

function totalShift(shift) {

    return (
        shift.deposit -
        shift.bankIn -
        shift.voucher
    );

}


/* =====================================================
   SALES PER TANGGAL
   ===================================================== */

function salesForDate(date) {

    return db.shifts
        .filter(
            shift =>
                shift.date === date
        )
        .reduce(
            (total, shift) =>
                total +
                totalShift(shift),
            0
        );

}


/* =====================================================
   RECEIPT PER TANGGAL
   ===================================================== */

function receiptsForDate(date) {

    return db.receipts
        .filter(
            receipt =>
                receipt.date === date
        )
        .reduce(
            (total, receipt) =>
                total +
                receipt.amount,
            0
        );

}


/* =====================================================
   BALANCE PER TANGGAL
   ===================================================== */

function balanceForDate(date) {

    return (
        salesForDate(date) -
        receiptsForDate(date)
    );

}


/* =====================================================
   DATE DISPLAY
   ===================================================== */

function pretty(date) {

    return new Date(
        date + "T00:00:00"
    ).toLocaleDateString(
        "ms-MY",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
   TOAST
   ===================================================== */

function toast(message) {

    const element =
        $("toast");

    element.textContent =
        message;

    element.classList.add(
        "show"
    );

    clearTimeout(
        window.__toastTimer
    );

    window.__toastTimer =
        setTimeout(
            () => {

                element.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

function esc(value) {

    return String(value)
        .replace(
            /[&<>"']/g,
            char => {

                const map = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                };

                return map[char];

            }
        );

}


/* =====================================================
   GET OUTLET
   ===================================================== */

function outlet(id) {

    return db.outlets.find(
        item =>
            item.id === id
    );

}


/* =====================================================
   NAVIGATION
   ===================================================== */

function showPage(id) {

    document
        .querySelectorAll(".page")
        .forEach(
            page =>
                page.classList.remove(
                    "active"
                )
        );

    const target =
        $(id);

    if (!target) {

        return;

    }

    target.classList.add(
        "active"
    );


    /*
       Update bottom navigation
    */

    document
        .querySelectorAll("nav button")
        .forEach(
            button =>
                button.classList.remove(
                    "active"
                )
        );


    const navButton =
        $("nav-" + id);

    if (navButton) {

        navButton.classList.add(
            "active"
        );

    }


    render();


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );

}


/* =====================================================
   ADD MODAL
   ===================================================== */

function openAdd() {

    $("addModal")
        .classList.add(
            "show"
        );

}


function closeAdd() {

    $("addModal")
        .classList.remove(
            "show"
        );

}


/* =====================================================
   SHIFT SELECT
   ===================================================== */

function setShift(shift) {

    currentShift =
        shift;

    $("pagiBtn")
        .classList.toggle(
            "selected",
            shift === "Pagi"
        );

    $("malamBtn")
        .classList.toggle(
            "selected",
            shift === "Malam"
        );

}


/* =====================================================
   RECEIPT TYPE
   ===================================================== */

function setReceiptType(type) {

    receiptType =
        type;


    $("outletType")
        .classList.toggle(
            "selected",
            type === "Outlet"
        );

    $("globalType")
        .classList.toggle(
            "selected",
            type === "Global"
        );


    $("receiptOutletWrap")
        .style.display =
            type === "Outlet"
                ? "block"
                : "none";

}


/* =====================================================
   FILL OUTLET SELECT
   ===================================================== */

function fillSelects() {

    const options =
        db.outlets
            .map(
                item => `
                    <option value="${item.id}">
                        ${esc(item.name)}
                    </option>
                `
            )
            .join("");


    if ($("shiftOutlet")) {

        $("shiftOutlet")
            .innerHTML =
            options;

    }


    if ($("receiptOutlet")) {

        $("receiptOutlet")
            .innerHTML =
            options;

    }

}


/* =====================================================
   SHIFT CALCULATOR
   ===================================================== */

function calcShift() {

    const deposit =
        val("deposit");

    const bankIn =
        val("bankIn");

    const voucher =
        val("voucher");


    const total =
        deposit -
        bankIn -
        voucher;


    $("calcTotal")
        .textContent =
        money(total);

}


/* =====================================================
   RESET SHIFT
   ===================================================== */

function resetShift() {

    $("shiftDate")
        .value =
        today();

    $("deposit")
        .value = "";

    $("bankIn")
        .value = "";

    $("voucher")
        .value = "";

    $("shiftNote")
        .value = "";


    setShift(
        "Pagi"
    );

    calcShift();

}


/* =====================================================
   SAVE SHIFT
   ===================================================== */

function saveShift() {

    const outletId =
        Number(
            $("shiftOutlet").value
        );

    const date =
        $("shiftDate").value;


    const deposit =
        val("deposit");

    const bankIn =
        val("bankIn");

    const voucher =
        val("voucher");


    if (!date) {

        toast(
            "Tanggal wajib diisi."
        );

        return;

    }


    if (
        deposit < 0 ||
        bankIn < 0 ||
        voucher < 0
    ) {

        toast(
            "Nominal tidak boleh negatif."
        );

        return;

    }


    if (
        deposit === 0 &&
        bankIn === 0 &&
        voucher === 0
    ) {

        toast(
            "Isi minimal satu nominal."
        );

        return;

    }


    /*
       Satu outlet hanya boleh
       punya satu Pagi dan satu Malam
       per tanggal.
    */

    const duplicate =
        db.shifts.find(
            shift =>
                shift.outletId === outletId &&
                shift.date === date &&
                shift.shift === currentShift
        );


    if (duplicate) {

        toast(
            "Shift ini sudah tercatat."
        );

        return;

    }


    db.shifts.push({

        id: Date.now(),

        outletId,

        date,

        shift: currentShift,

        deposit,

        bankIn,

        voucher,

        note:
            $("shiftNote")
                .value
                .trim()

    });


    saveDB();


    toast(
        "Shift berhasil disimpan."
    );


    resetShift();


    showPage(
        "daily"
    );

}


/* =====================================================
   SHIFT HTML
   ===================================================== */

function shiftHTML(shift) {

    const shop =
        outlet(
            shift.outletId
        );


    return `
        <div class="card">

            <div class="row">

                <b>
                    ${esc(
                        shop
                            ? shop.name
                            : "Kedai"
                    )}

                    ·

                    ${esc(
                        shift.shift
                    )}
                </b>

                <span class="chip">
                    ${pretty(
                        shift.date
                    )}
                </span>

            </div>


            <div class="line">

                <span>
                    Deposit
                </span>

                <b>
                    + ${money(
                        shift.deposit
                    )}
                </b>

            </div>


            <div class="line">

                <span>
                    Bank In
                </span>

                <b>
                    − ${money(
                        shift.bankIn
                    )}
                </b>

            </div>


            <div class="line">

                <span>
                    Voucher
                </span>

                <b>
                    − ${money(
                        shift.voucher
                    )}
                </b>

            </div>


            <div
                class="row"
                style="margin-top:10px">

                <b>
                    Total Cash
                </b>

                <b
                    style="color:var(--green)">

                    ${money(
                        totalShift(
                            shift
                        )
                    )}

                </b>

            </div>


            ${
                shift.note
                    ? `
                        <div
                            class="muted"
                            style="margin-top:7px">

                            Catatan:
                            ${esc(
                                shift.note
                            )}

                        </div>
                    `
                    : ""
            }


            <button
                class="btn danger"
                style="margin-top:11px"
                onclick="deleteShift(${shift.id})">

                Hapus

            </button>

        </div>
    `;

}


/* =====================================================
   DELETE SHIFT
   ===================================================== */

function deleteShift(id) {

    if (
        !confirm(
            "Hapus shift ini?"
        )
    ) {

        return;

    }


    db.shifts =
        db.shifts.filter(
            shift =>
                shift.id !== id
        );


    saveDB();

    render();

    toast(
        "Shift dihapus."
    );

}


/* =====================================================
   DASHBOARD
   ===================================================== */

function renderDashboard() {

    const date =
        today();


    const sales =
        salesForDate(
            date
        );

    const receipts =
        receiptsForDate(
            date
        );


    $("dashCash")
        .textContent =
        money(
            sales
        );


    $("dashReceipt")
        .textContent =
        money(
            receipts
        );


    $("dashBalance")
        .textContent =
        money(
            sales -
            receipts
        );


    /*
       Daily Sales per Kedai
    */

    $("dashOutlets")
        .innerHTML =
        db.outlets
            .map(
                shop => {

                    const shifts =
                        db.shifts.filter(
                            shift =>
                                shift.date === date &&
                                shift.outletId === shop.id
                        );


                    const cash =
                        shifts.reduce(
                            (
                                total,
                                shift
                            ) =>
                                total +
                                totalShift(
                                    shift
                                ),
                            0
                        );


                    return `
                        <button
                            class="card"
                            style="text-align:left"
                            onclick="openOutlet(${shop.id})">

                            <div class="outlet-head">

                                <div class="icon">
                                    🏪
                                </div>

                                <div>

                                    <b>
                                        ${esc(
                                            shop.name
                                        )}
                                    </b>

                                    <div class="muted">

                                        ${shifts.length}
                                        shift hari ini

                                    </div>

                                </div>

                            </div>


                            <div class="money">

                                ${money(
                                    cash
                                )}

                            </div>

                        </button>
                    `;

                }
            )
            .join("");


    /*
       Aktivitas Hari Ini
    */

    $("todaySummary")
        .innerHTML = `

            <div class="line">

                <span>
                    Total Shift
                </span>

                <b>
                    ${
                        db.shifts.filter(
                            shift =>
                                shift.date === date
                        ).length
                    }
                </b>

            </div>


            <div class="line">

                <span>
                    Daily Sales
                </span>

                <b>
                    ${money(
                        sales
                    )}
                </b>

            </div>


            <div class="line">

                <span>
                    Pengeluaran Resit
                </span>

                <b>
                    − ${money(
                        receipts
                    )}
                </b>

            </div>


            <div class="line">

                <span>
                    Balance
                </span>

                <b
                    style="color:var(--green)">

                    ${money(
                        sales -
                        receipts
                    )}

                </b>

            </div>

        `;

}


/* =====================================================
   OUTLET LIST
   ===================================================== */

function renderOutlets() {

    /*
       Hanya render kalau
       halaman outlet sedang list.
    */

    const container =
        $("outletList");


    if (!container) {

        return;

    }


    container.innerHTML =
        db.outlets
            .map(
                shop => {

                    const total =
                        db.shifts
                            .filter(
                                shift =>
                                    shift.outletId ===
                                    shop.id
                            )
                            .reduce(
                                (
                                    total,
                                    shift
                                ) =>
                                    total +
                                    totalShift(
                                        shift
                                    ),
                                0
                            );


                    const shiftCount =
                        db.shifts.filter(
                            shift =>
                                shift.outletId ===
                                shop.id
                        ).length;


                    return `

                        <div class="card">

                            <div class="row">

                                <div class="outlet-head">

                                    <div class="icon">
                                        🏪
                                    </div>

                                    <div>

                                        <b>
                                            ${esc(
                                                shop.name
                                            )}
                                        </b>

                                        <div class="muted">

                                            ${shiftCount}
                                            shift total

                                        </div>

                                    </div>

                                </div>


                                <b>
                                    ${money(
                                        total
                                    )}
                                </b>

                            </div>


                            <div class="actions">

                                <button
                                    class="btn secondary"
                                    onclick="openOutletForm(${shop.id})">

                                    Edit Nama

                                </button>


                                <button
                                    class="btn secondary"
                                    onclick="openOutlet(${shop.id})">

                                    Lihat Detail

                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   ADD / EDIT OUTLET
   ===================================================== */

function openOutletForm(id = null) {

    editingOutletId =
        id;


    $("outletFormTitle")
        .textContent =
            id
                ? "Edit Nama Kedai"
                : "Tambah Kedai";


    $("outletName")
        .value =
            id
                ? outlet(id).name
                : "";


    $("outletModal")
        .classList.add(
            "show"
        );


    setTimeout(
        () =>
            $("outletName")
                .focus(),
        50
    );

}


function closeOutletForm() {

    $("outletModal")
        .classList.remove(
            "show"
        );

    editingOutletId =
        null;

}


/* =====================================================
   SAVE OUTLET
   ===================================================== */

function saveOutlet() {

    const name =
        $("outletName")
            .value
            .trim();


    if (!name) {

        toast(
            "Nama kedai wajib diisi."
        );

        return;

    }


    /*
       EDIT
    */

    if (editingOutletId) {

        const shop =
            outlet(
                editingOutletId
            );


        shop.name =
            name;


        toast(
            "Nama kedai diperbarui."
        );

    }

    /*
       TAMBAH
    */

    else {

        const newId =
            db.outlets.reduce(
                (
                    max,
                    shop
                ) =>
                    Math.max(
                        max,
                        shop.id
                    ),
                0
            ) + 1;


        db.outlets.push({

            id: newId,

            name: name

        });


        toast(
            "Kedai baru ditambahkan."
        );

    }


    saveDB();

    fillSelects();

    closeOutletForm();

    render();

}


/* =====================================================
   DETAIL KEDAI
   ===================================================== */

function openOutlet(id) {

    const shop =
        outlet(id);


    if (!shop) {

        toast(
            "Kedai tidak ditemukan."
        );

        return;

    }


    const date =
        today();


    const rows =
        db.shifts
            .filter(
                shift =>
                    shift.outletId === id
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.date.localeCompare(
                        a.date
                    )
            );


    const dailyCash =
        db.shifts
            .filter(
                shift =>
                    shift.outletId === id &&
                    shift.date === date
            )
            .reduce(
                (
                    total,
                    shift
                ) =>
                    total +
                    totalShift(
                        shift
                    ),
                0
            );


    /*
       PENTING:
       Jangan panggil renderOutlets()
       setelah innerHTML detail.

       Kalau renderOutlets() dipanggil,
       detail akan tertimpa lagi.
    */

    $("outlets")
        .innerHTML = `

            <button
                class="back"
                onclick="showPage('outlets')">

                ‹ Kembali

            </button>


            <div class="row">

                <h2>
                    ${esc(
                        shop.name
                    )}
                </h2>


                <button
                    class="btn secondary"
                    style="width:auto"
                    onclick="openOutletForm(${id})">

                    Edit

                </button>

            </div>


            <div class="card">

                <div class="muted">
                    Daily Sales Hari Ini
                </div>

                <div
                    class="money"
                    style="font-size:28px">

                    ${money(
                        dailyCash
                    )}

                </div>

            </div>


            <h2>
                Riwayat Shift
            </h2>


            <div class="list">

                ${
                    rows.length
                        ? rows
                            .map(
                                shiftHTML
                            )
                            .join("")
                        : `
                            <div class="card empty">

                                Belum ada
                                data shift.

                            </div>
                        `
                }

            </div>

        `;


    /*
       Tampilkan halaman Kedai
    */

    document
        .querySelectorAll(".page")
        .forEach(
            page =>
                page.classList.remove(
                    "active"
                )
        );


    $("outlets")
        .classList.add(
            "active"
        );


    /*
       Active bottom navigation
    */

    document
        .querySelectorAll("nav button")
        .forEach(
            button =>
                button.classList.remove(
                    "active"
                )
        );


    $("nav-outlets")
        .classList.add(
            "active"
        );


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );

}


/* =====================================================
   DAILY SALES
   ===================================================== */

function renderDaily() {

    const date =
        $("dailyDate").value ||
        today();


    const sales =
        salesForDate(
            date
        );


    const receipts =
        receiptsForDate(
            date
        );


    $("dailyResult")
        .innerHTML = `

            <div class="hero">

                <small>
                    ${pretty(date)}
                </small>

                <div class="amount">

                    ${money(
                        sales
                    )}

                </div>


                <div class="stats">

                    <div class="stat">

                        <small>
                            Resit −
                        </small>

                        <b>
                            ${money(
                                receipts
                            )}
                        </b>

                    </div>


                    <div class="stat">

                        <small>
                            Balance
                        </small>

                        <b>
                            ${money(
                                sales -
                                receipts
                            )}
                        </b>

                    </div>

                </div>

            </div>


            <h2>
                Per Kedai
            </h2>


            <div class="list">

                ${
                    db.outlets
                        .map(
                            shop => {

                                const shifts =
                                    db.shifts.filter(
                                        shift =>
                                            shift.outletId === shop.id &&
                                            shift.date === date
                                    );


                                const total =
                                    shifts.reduce(
                                        (
                                            sum,
                                            shift
                                        ) =>
                                            sum +
                                            totalShift(
                                                shift
                                            ),
                                        0
                                    );


                                return `

                                    <div class="card">

                                        <div class="row">

                                            <b>
                                                ${esc(
                                                    shop.name
                                                )}
                                            </b>

                                            <b>
                                                ${money(
                                                    total
                                                )}
                                            </b>

                                        </div>


                                        <div
                                            class="muted"
                                            style="margin-top:6px">

                                            ${
                                                shifts.length
                                                    ? shifts
                                                        .map(
                                                            shift =>
                                                                shift.shift +
                                                                ": " +
                                                                money(
                                                                    totalShift(
                                                                        shift
                                                                    )
                                                                )
                                                        )
                                                        .join(
                                                            " · "
                                                        )
                                                    : "Belum ada shift"
                                            }

                                        </div>

                                    </div>

                                `;

                            }
                        )
                        .join("")
                }

            </div>

        `;

}


/* =====================================================
   HISTORY SALES
   ===================================================== */

function renderHistory() {

    const month =
        $("historyMonth").value ||
        today().slice(
            0,
            7
        );


    const dates =
        [
            ...new Set(
                [
                    ...db.shifts.map(
                        shift =>
                            shift.date
                    ),

                    ...db.receipts.map(
                        receipt =>
                            receipt.date
                    )
                ]
            )
        ]
        .filter(
            date =>
                date.startsWith(
                    month
                )
        )
        .sort(
            (
                a,
                b
            ) =>
                b.localeCompare(a)
        );


    if (!dates.length) {

        $("historyList")
            .innerHTML = `

                <div class="card empty">

                    Belum ada history
                    sales untuk bulan ini.

                </div>

            `;

        return;

    }


    $("historyList")
        .innerHTML =
        dates
            .map(
                date => `

                    <button
                        class="card"
                        style="
                            text-align:left;
                            width:100%;
                        "
                        onclick="
                            openDaily('${date}')
                        ">

                        <div class="row">

                            <b>
                                ${pretty(date)}
                            </b>

                            <b>
                                ${money(
                                    salesForDate(
                                        date
                                    )
                                )}
                            </b>

                        </div>


                        <div class="line">

                            <span>
                                Sales
                            </span>

                            <b>
                                ${money(
                                    salesForDate(
                                        date
                                    )
                                )}
                            </b>

                        </div>


                        <div class="line">

                            <span>
                                Resit −
                            </span>

                            <b>
                                ${money(
                                    receiptsForDate(
                                        date
                                    )
                                )}
                            </b>

                        </div>


                        <div class="row">

                            <span>
                                Balance
                            </span>

                            <b
                                style="
                                    color:var(--green)
                                ">

                                ${money(
                                    balanceForDate(
                                        date
                                    )
                                )}

                            </b>

                        </div>

                    </button>

                `
            )
            .join("");

}


/* =====================================================
   OPEN DAILY FROM HISTORY
   ===================================================== */

function openDaily(date) {

    $("dailyDate")
        .value =
        date;


    showPage(
        "daily"
    );

}


/* =====================================================
   RECEIPTS
   ===================================================== */

function renderReceipts() {

    const todayDate =
        today();


    $("receiptTotal")
        .textContent =
        money(
            receiptsForDate(
                todayDate
            )
        );


    const receipts =
        [...db.receipts]
            .sort(
                (
                    a,
                    b
                ) =>
                    b.date.localeCompare(
                        a.date
                    )
            );


    if (!receipts.length) {

        $("receiptList")
            .innerHTML = `

                <div class="card empty">

                    Belum ada resit.

                </div>

            `;

        return;

    }


    $("receiptList")
        .innerHTML =
        receipts
            .map(
                receipt => {

                    const shop =
                        receipt.outletId
                            ? outlet(
                                receipt.outletId
                            )
                            : null;


                    return `

                        <div class="card">

                            <div class="row">

                                <b>
                                    ${esc(
                                        receipt.desc
                                    )}
                                </b>

                                <b>
                                    − ${money(
                                        receipt.amount
                                    )}
                                </b>

                            </div>


                            <div
                                class="muted"
                                style="margin-top:6px">

                                ${pretty(
                                    receipt.date
                                )}

                                ·

                                ${esc(
                                    receipt.category
                                )}

                                ·

                                ${receipt.type}


                                ${
                                    receipt.type === "Outlet"
                                        ? " · " +
                                          esc(
                                              shop
                                                  ? shop.name
                                                  : "Kedai"
                                          )
                                        : ""
                                }

                            </div>


                            <button
                                class="btn danger"
                                style="margin-top:10px"
                                onclick="
                                    deleteReceipt(
                                        ${receipt.id}
                                    )
                                ">

                                Hapus

                            </button>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   DELETE RECEIPT
   ===================================================== */

function deleteReceipt(id) {

    if (
        !confirm(
            "Hapus resit ini?"
        )
    ) {

        return;

    }


    db.receipts =
        db.receipts.filter(
            receipt =>
                receipt.id !== id
        );


    saveDB();

    render();

    toast(
        "Resit dihapus."
    );

}


/* =====================================================
   SAVE RECEIPT
   ===================================================== */

function saveReceipt() {

    const date =
        $("receiptDate")
            .value;


    const description =
        $("receiptDesc")
            .value
            .trim();


    const amount =
        val(
            "receiptAmount"
        );


    if (
        !date ||
        !description ||
        amount <= 0
    ) {

        toast(
            "Tanggal, keterangan, dan jumlah wajib diisi."
        );

        return;

    }


    db.receipts.push({

        id: Date.now(),

        date,

        category:
            $("receiptCategory")
                .value,

        desc:
            description,

        amount,

        type:
            receiptType,

        outletId:
            receiptType === "Outlet"
                ? Number(
                    $("receiptOutlet")
                        .value
                )
                : null

    });


    saveDB();


    $("receiptDesc")
        .value = "";

    $("receiptAmount")
        .value = "";


    toast(
        "Resit tersimpan sebagai pengeluaran (−)."
    );


    showPage(
        "receipts"
    );

}


/* =====================================================
   RENDER ALL
   ===================================================== */

function render() {

    fillSelects();

    renderDashboard();

    renderOutlets();

    renderDaily();

    renderHistory();

    renderReceipts();

}


/* =====================================================
   INITIALIZATION
   ===================================================== */

function init() {

    const now =
        new Date();


    $("today")
        .textContent =
        now.toLocaleDateString(
            "ms-MY",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );


    $("shiftDate")
        .value =
        today();


    $("receiptDate")
        .value =
        today();


    $("dailyDate")
        .value =
        today();


    $("historyMonth")
        .value =
        today().slice(
            0,
            7
        );


    fillSelects();

    render();

    calcShift();

}


/* =====================================================
   START APP
   ===================================================== */

init();