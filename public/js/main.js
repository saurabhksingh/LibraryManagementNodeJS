var AppRouter = Backbone.Router.extend({

    routes: {
        ""                  : "home",
        "books"	            : "list",
        "books/page/:page"  : "gridView",
        "books/listView"    : "lisView",
        "books/gridView"    : "gridView",
        'searchBooks/:id'	    : "searchResult",
        "books/add"        : "addBook",
        "books/:id"         : "bookDetails",
        "about"             : "about"
    },

    initialize: function () {
        this.headerView = new HeaderView();
        $('.header').html(this.headerView.el);
    },

    home: function (id) {
        if (!this.homeView) {
            this.homeView = new HomeView();
        }
        $('#content').html(this.homeView.el);
        this.headerView.selectMenuItem('home-menu');
    },
    
    searchResult: function(searchQuery) {
    	    //var searchQuery = $("#searchBooksForm").children("input[name='bookTitle']").val();
    	    //alert(searchQuery);
            var p = 1;//page ? parseInt(page, 10) : 1;
            var bookList = new SearchedBookCollection();
            bookList.url = '/searchBooks?bookTitle='+searchQuery;
            bookList.fetch({success: function(){
                $("#content").html(new BookSimpleListView({model: bookList, page: p}).el);
            }});
            this.headerView.selectMenuItem('home-menu');
    },

	list: function(page) {
        var p = page ? parseInt(page, 10) : 1;
        var bookList = new BookCollection();
        bookList.fetch({success: function(){
            $("#content").html(new BookSimpleListView({model: bookList, page: p}).el);
        }});
        this.headerView.selectMenuItem('home-menu');
    },

    lisView: function(page) {
        var p = page ? parseInt(page, 10) : 1;
        var bookList = new BookCollection();
        bookList.fetch({success: function(){
            $("#content").html(new BookSimpleListView({model: bookList, page: p}).el);
        }});
        this.headerView.selectMenuItem('home-menu');
    },
    
    gridView: function(page) {
            var p = page ? parseInt(page, 10) : 1;
            var bookList = new BookCollection();
            bookList.fetch({success: function(){
                $("#content").html(new BookListView({model: bookList, page: p}).el);
            }});
            this.headerView.selectMenuItem('home-menu');
    },

    bookDetails: function (id) {
        var book = new Book({_id: id});
        book.fetch({success: function(){
            $("#content").html(new BookView({model: book}).el);
        }});
        this.headerView.selectMenuItem();
    },

	addBook: function() {
        var book = new Book();
        $('#content').html(new BookView({model: book}).el);
        this.headerView.selectMenuItem('add-menu');
	},

    about: function () {
        if (!this.aboutView) {
            this.aboutView = new AboutView();
        }
        $('#content').html(this.aboutView.el);
        this.headerView.selectMenuItem('about-menu');
    }

});

utils.loadTemplate(['HomeView', 'HeaderView', 'BookView', 'BookSimpleListItemView', 'BookListItemView', 'AboutView'], function() {
    app = new AppRouter();
    Backbone.history.start();
});