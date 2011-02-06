This is an client side alternative to the Facebook Multi-Friend Selector that 
relies on jQuery. No server side component necessary which makes it really
easy to adapt and use. 

Check out this blog post with more details and [screencast](http://bit.ly/cHDkzm).

To see a demo go [here](http://mbrevoort.github.com/jquery-facebook-multi-friend-selector/).

Click login and login to your facebook account and you should see the friend selector.

Much can be customized by CSS, for example if you want a stacked list type selector that's [more stripped down](http://mbrevoort.github.com/jquery-facebook-multi-friend-selector/list.html)


This plugin is depends on the new Facebook Javascript API
> <script src="http://connect.facebook.net/en_US/all.js"></script>

There's a jquery plugin and accompanying CSS file

Assuming you have a container like:
> <div id="jfmfs-container"></div>

And you have included the Facebook Javascript API
And you have already logged the user in. (FB.init and FB.login)

You can load the friend selector in a container like this:
> $("#jfmfs-container").jfmfs();

This should fetch the current users friends and give you the interface to select friends. Then when you're ready to move on, there's a function to call that returns an array of the Facebook Ids of the selected friends. 

var friendSelector  = $("#jfmfs-container").data('jfmfs');
var selectedFriends = friendSelector.getSelectedIds();

Options
-------
These options can be passed into the jfmfs function with a map of options like jfmfs({key1: val, key2: val})

* max_selected: int (optional)- max number of items that can be selected
* labels: object with i18n labels for translations. If you pass this, you need to define all of the labels.

		labels: {
			selected: "Selected",
			filter_default: "Start typing a name",
			filter_title: "Find Friends:",
			all: "All",
			max_selected_message: "{0} of {1} selected"
			// message to display showing how many items are already selected like: "{0} of {1} chosen"
		}

* friend_fields: a comma separated list of fields to return in case you need additional fields for sorting. However you should always at least specify: "id,name",
* sorter: a function reference that will be called to do the sorting. It takes two arguments which are the two friend objects to be compared and returns "truthy if the first should come before the second. The default is:

		function(a, b) {
			var x = a.name.toLowerCase();
			var y = b.name.toLowerCase();
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		}

* pre_selected_friends: an array of ids of friends to preselect once loaded like: pre_selected_friends: [1014025367]

* exclude_friends: an array of ids of friends to exclude from the list like: exclude_friends: [33333333]

For example your options might look like this if you want a max of 3 friends selected, friends 11111111 and 22222222 preselected, friend 33333333 excluded from the list and to sort by friends' last name:

		{
		    max_selected: 3,
		    max_selected_message: "{0} of {1} sucker selected",
			friend_fields: "id,name,last_name",
			pre_selected_friends: [11111111, 22222222],
			exclude_friends: [33333333],
			sorter: function(a, b) {
		        var x = a.last_name.toLowerCase();
		        var y = b.last_name.toLowerCase();
		        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		    }
		}

Events
------
jfmfs.friendload.finished - triggered on the container when the list of friends is finished loading

		$("#jfmfs-container").bind("jfmfs.friendload.finished", function() { 
		    alert("finished loaded!"); 
		});

jfmfs.selection.changed - triggered on the container when a selection has changed with an array of selected friends each like { id: "123", name: "John Doe"}

		$("#jfmfs-container").bind("jfmfs.selection.changed", function(e, data) { 
		    console.log("changed", data);
		});                     

Changelog
=========

# Version v4
2/5/2011:

* Fixed issue with images not loading when list is filtered 

* Added i18n label object option to override default text

* Fixed bug when there was only one row of friends

* Added minified version [5.37KB (2.06KB gzipped)]

# Version v3 
1/28/2011:

* Added customizable sorter option (see details in options section)

* Added pre_selected_friends option (see details in options section)

* Added exclude_friends option (see details in options section)

# Version v2 (yeah, not 0.0.0.2)  
1/21/2011:

* Added some performance optimizations especially with a large number of friends

* Custom events for notification when friends are loaded or selections change

* Progressive image loading when scrolling including the usage of Ben Alman's awesome throttle/debounce library for smoother scrolling

Plan to make some more enhancements are refactor code for to better enable unit tests


