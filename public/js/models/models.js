window.Book = Backbone.Model.extend({

    urlRoot: "/books",

    idAttribute: "_id",

    initialize: function () {
        this.validators = {};

        this.validators.name = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "You must enter book name"};
        };
        
        this.validators.owner = function (value) {
	            return value.indexOf("@expedia.com", value.length - "@expedia.com".length) !== -1 ? {isValid: true} : {isValid: false, message: "You must enter a valid expedia email id."};
        };

        this.validators.author = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "You must enter Author(s) name"};
        };
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },

    defaults: {
        _id: null,
        name: "",
        owner: "",
        author: "",
        year: "",
        description: "",
        oldOwnerId: "",
        picture: "generic.jpeg"
    }
});

window.BookCollection = Backbone.Collection.extend({

    model: Book,

    url: "/books"

});

window.SearchedBookCollection = Backbone.Collection.extend({

    model: Book,

    url: "/searchBooks"

});