export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function compareByName(a, b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

export function serializeForm(form) {
    let serialized = form.serializeArray();
    let data = {};
    for (let i = 0; i < serialized.length; i++) {
        data[serialized[i]['name']] = serialized[i]['value'];
    }
    return data;
}

export function staticPath(path) {
    return '/static/' + path;
}
