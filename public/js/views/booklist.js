window.BookListView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        var books = this.model.models;
        var len = books.length;
        var startPos = (this.options.page - 1) * 8;
        var endPos = Math.min(startPos + 8, len);

        $(this.el).html('<ul class="thumbnails"></ul>');

        for (var i = startPos; i < endPos; i++) {
            $('.thumbnails', this.el).append(new BookListItemView({model: books[i]}).render().el);
        }

        $(this.el).append(new Paginator({model: this.model, page: this.options.page}).render().el);

        return this;
    }
});

window.BookSimpleListView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        var books = this.model.models;
        var len = books.length;

        $(this.el).html('<table class="table table-striped"><thead><tr><th>Book Name</th><th>Author(s)</th><th>Current Owner</th></tr></thead><tbody class=bookDetails></tbody></table>');

        for (var i = 0; i < len; i++) {
            $('.bookDetails', this.el).append(new BookSimpleListItemView({model: books[i]}).render().el);
        }

        return this;
    }
});

window.BookListItemView = Backbone.View.extend({

    tagName: "li",

    initialize: function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }

});
window.BookSimpleListItemView = Backbone.View.extend({

    tagName: "tr",

    initialize: function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }

});