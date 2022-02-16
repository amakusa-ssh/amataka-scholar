function openPdf(base64str) {
    const str = String(base64str).split("data:application/pdf;base64,")[1];
    const file = new Blob([atob(str)], {
        type: 'application/pdf'
    });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
}