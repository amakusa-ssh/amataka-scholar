function openPdf(base64str) {
    const fileURL = URL.createObjectURL(base64str);
    window.open(fileURL);
}