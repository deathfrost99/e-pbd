const searchForm = document.getElementById("searchForm");
const studentIdInput = document.getElementById("studentId");

const searchSection = document.getElementById("searchSection");
const loadingSection = document.getElementById("loadingSection");
const resultSection = document.getElementById("resultSection");

const messageBox = document.getElementById("messageBox");
const resultTableBody = document.getElementById("resultTableBody");

const backButton = document.getElementById("backButton");
const printButton = document.getElementById("printButton");

const API_URL = "https://script.google.com/macros/s/AKfycbzUZB5v2fwbL1_aseQr5iOuZlhBkJ4qT6koukGCkBW1BkrEbfac9AQmMJFHE6kIrNE/exec";

studentIdInput.addEventListener("input", function () {
    // Hanya benarkan nombor
    this.value = this.value.replace(/\D/g, "");

    hideMessage();
});

searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const studentId = studentIdInput.value.trim();

    if (studentId.length !== 12) {
        showMessage("Sila masukkan 12 digit nombor kad pengenalan.");
        return;
    }

    showLoading();

    try {
        const requestUrl =
            `${API_URL}?id=${encodeURIComponent(studentId)}`;

        const response = await fetch(requestUrl);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            showSearch();
            showMessage(
                data.message ||
                "Maklumat murid tidak dijumpai."
            );
            return;
        }

        displayResult(data.student);

    } catch (error) {
        console.error("Ralat API:", error);

        showSearch();
        showMessage(
            "Sistem tidak dapat dihubungi. Sila cuba sebentar lagi."
        );
    }
});

backButton.addEventListener("click", function () {
    studentIdInput.value = "";
    resultTableBody.innerHTML = "";

    showSearch();
    studentIdInput.focus();
});

printButton.addEventListener("click", function () {
    window.print();
});

function showLoading() {
    hideMessage();

    searchSection.classList.add("hidden");
    resultSection.classList.add("hidden");
    loadingSection.classList.remove("hidden");
}

function showSearch() {
    loadingSection.classList.add("hidden");
    resultSection.classList.add("hidden");
    searchSection.classList.remove("hidden");
}

function displayResult(student) {
    document.getElementById("resultName").textContent = student.name;
    document.getElementById("resultId").textContent = formatIdentityNumber(student.id);
    document.getElementById("resultClass").textContent = student.className;

    resultTableBody.innerHTML = "";

    let total = 0;

    student.subjects.forEach(function (subject, index) {
        const numericMark = Number(
    String(subject.mark).replace(",", ".")
);

if (!Number.isNaN(numericMark)) {
    total += numericMark;
}

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${subject.name}</td>
            <td>${subject.mark}</td>
            <td>
                <span class="grade-badge ${getGradeClass(subject.grade)}">
                    ${subject.grade}
                </span>
            </td>
        `;

        resultTableBody.appendChild(row);
    });

    const validMarks = student.subjects.filter(function (subject) {
    const mark = Number(
        String(subject.mark).replace(",", ".")
    );

    return !Number.isNaN(mark);
});

const average = validMarks.length > 0
    ? total / validMarks.length
    : 0;

    document.getElementById("totalMarks").textContent = total;
    document.getElementById("averageMarks").textContent = average.toFixed(2);
    document.getElementById("performanceText").textContent = getPerformance(average);

    loadingSection.classList.add("hidden");
    searchSection.classList.add("hidden");
    resultSection.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function getGradeClass(grade) {
    const cleanedGrade = String(grade).toUpperCase();

    if (cleanedGrade.startsWith("A")) {
        return "grade-a";
    }

    if (cleanedGrade.startsWith("B")) {
        return "grade-b";
    }

    if (cleanedGrade.startsWith("C")) {
        return "grade-c";
    }

    return "grade-d";
}

function getPerformance(average) {
    if (average >= 80) {
        return "Cemerlang";
    }

    if (average >= 65) {
        return "Baik";
    }

    if (average >= 50) {
        return "Memuaskan";
    }

    return "Perlu Bimbingan";
}

function formatIdentityNumber(id) {
    return `${id.slice(0, 6)}-${id.slice(6, 8)}-${id.slice(8)}`;
}

function showMessage(message) {
    messageBox.textContent = message;
    messageBox.className = "message error";
}

function hideMessage() {
    messageBox.textContent = "";
    messageBox.className = "message hidden";
}