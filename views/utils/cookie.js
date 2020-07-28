export function getCookie(key) {
    const cookies = document.cookie.split(";")
    const map = new Map();
    cookies.forEach(element => {
        let t = element.split("=")
        map.set(t[0].trim(),t[1])
    });
    return map.get(key)
}