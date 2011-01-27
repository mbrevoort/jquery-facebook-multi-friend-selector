# Version v2 (yeah, not 0.0.0.2)  
1/21/2011:

* Added some performance optimizations especially with a large number of friends

* Custom events for notification when friends are loaded or selections change

* Progressive image loading when scrolling including the usage of Ben Alman's awesome throttle/debounce library for smoother scrolling

Plan to make some more enhancements are refactor code for to better enable unit tests

# Version v1, etc

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

max_selected: int (optional)- max number of items that can be selected
max_selected_message: String (optional, but required if max_selected specified) - message to display showing how many items are already selected like: "{0} of {1} chosen"}

Events
------
jfmfs.friendload.finished - triggered on the container when the list of friends is finished loading

> $("#jfmfs-container").bind("jfmfs.friendload.finished", function() { 
>     alert("finished loaded!"); 
> });

jfmfs.selection.changed - triggered on the container when a selection has changed with an array of selected friends each like { id: "123", name: "John Doe"}

> $("#jfmfs-container").bind("jfmfs.selection.changed", function(e, data) { 
>     console.log("changed", data);
> });                     

