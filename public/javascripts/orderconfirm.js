document.addEventListener("DOMContentLoaded", function () {
    history.pushState(null, null, location.href);

    window.addEventListener("popstate", function () {
        // User tries to go back → stay here
        window.location.href = "/orderconfirm";
    });
});