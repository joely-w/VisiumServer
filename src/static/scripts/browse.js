const cmp = function (a, b) {

    if (a.data.folder === b.data.folder) {
        return (a.data.id > b.data.id) ? 1 : -1;
    } else {
        return (a.data.folder > b.data.folder) ? 1 : -1;
    }
};

function loadPdf(project_name, filepath) {
    $("#hist").html(`<embed src="/api/directory/${project_name}/pdf?filename=${filepath}" type="application/pdf" width="100%" height="100%" />`)
    $("#graph").show()
}

function resetSearch() {
    $("#tree").jstree('clear_search');
    $("#reset_btn").hide();
}

$(document).ready(() => {
    $('#tree').on("select_node.jstree", function (e, data) {
        const path = data.node.id;
        const splits = path.split('.');
        const ext = splits[splits.length - 1];
        const project_name = $("#files").val()
        const full_path = project_name + '/' + path;
        const filetree = $("#file-tree")
        switch (ext) {
            case "yaml":
                filetree.hide()
                loadAll('histogram', full_path);
                break;
            case "txt":
                filetree.hide()
                loadAll('correlation_matrix', full_path);
                break;
            case "pdf":
                filetree.hide();
                loadPdf(project_name, path)
        }
    });
    $("#search_btn").click(function () {
        const search = $("#search").val();
        if (!search.trim()) {
            resetSearch();
        }
        $("#reset_btn").show()
        $("#tree").jstree("search", search.trim());
    })
    $("#reset_btn").click(function () {
        resetSearch();
    })
    $.get("/api/browse", response => {
        for (let i = 0; i < response.result.length; i++) {
            $("#files").append(`<option>${response.result[i]}</option>`)
        }
    });
    $("#files").change(() => {
        $.get(`/api/directory/${$("#files").val()}`, response => {
            response = JSON.parse(response)
            $("#file-tree").show();
            $("#select").hide()
            $('#tree').jstree({
                plugins: ["types", "sort", "search", "checkbox"], core: {
                    data: response.children
                }, search: {
                    show_only_matches: true, case_insensitive: true,
                }, sort: function (a, b) {
                    a1 = this.get_node(a);
                    b1 = this.get_node(b);
                    if (a1.icon === b1.icon) {
                        return (a1.text > b1.text) ? 1 : -1;
                    } else {
                        return (a1.icon === 'folder') ? 1 : -1
                    }
                }, types: {
                    file: {
                        icon: "fa fa-file text-warning"
                    }, folder: {
                        icon: "fa fa-folder"
                    }
                },
            });

        })
    });
    $("#back").click(() => {
        $("#graph").hide()
        $("#hist").html(null)
        $("#file-tree").show()
    })
})
