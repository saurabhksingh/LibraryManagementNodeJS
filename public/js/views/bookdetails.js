window.BookView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        "change"        : "change",
        "click .save"   : "beforeSave",
        "click .delete" : "deleteBook",
        "click .return" : "returnBook",
        "drop #picture" : "dropHandler"
    },

    change: function (event) {
        // Remove any existing alert message
        utils.hideAlert();

        // Apply the change to the model
        var target = event.target;
        var jsonData = this.model.toJSON();
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);
        change["oldOwnerId"] = jsonData["owner"];
        this.model.set(change);
        var check = this.model.validateItem(target.id);
        if (check.isValid === false) {
            utils.addValidationError(target.id, check.message);
        } else {
            utils.removeValidationError(target.id);
        }
    },

    returnBook: function () {
        var change = {};
        change["owner"] = "expedialibrary@expedia.com";
        this.model.set(change);
        
        this.saveBook();
        return false;
    },

    beforeSave: function () {
        var self = this;
        var check = this.model.validateAll();
        if (check.isValid === false) {
            utils.displayValidationErrors(check.messages);
            return false;
        }
        this.saveBook();
        return false;
    },

    saveBook: function () {
        var self = this;
        //console.log('before save');
        this.model.save(null, {
            success: function (model) {
                self.render();
                app.navigate('books/' + model.id, false);
                utils.showAlert('Success!', 'Book saved successfully', 'alert-success');
            },
            error: function () {
                utils.showAlert('Error', 'An error occurred while trying to delete this item', 'alert-error');
            }
        });
    },


    deleteBook: function () {
        this.model.destroy({
            success: function () {
                alert('Book deleted successfully');
                window.history.back();
            }
        });
        return false;
    },

    dropHandler: function (event) {
        event.stopPropagation();
        event.preventDefault();
        var e = event.originalEvent;
        e.dataTransfer.dropEffect = 'copy';
        this.pictureFile = e.dataTransfer.files[0];

        // Read the image file from the local file system and display it in the img tag
        var reader = new FileReader();
        reader.onloadend = function () {
            $('#picture').attr('src', reader.result);
        };
        reader.readAsDataURL(this.pictureFile);
    }

});