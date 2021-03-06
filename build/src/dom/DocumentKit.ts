class DocumentKit {
    static copy(value: string, callback?: (value: string) => void) {
        const target = document.createElement("input");
        target.style.opacity = "0";
        target.value = value;
        document.body.appendChild(target);
        target.select();
        document.execCommand("copy");
        target.remove();
        if (callback) {
            callback(value);
        }
    }
}
