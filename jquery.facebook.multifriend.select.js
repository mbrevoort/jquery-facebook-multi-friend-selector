// Copyright 2010 Mike Brevoort http://mike.brevoort.com @mbrevoort
// 
// v1.0 jquery-facebook-multi-friend-selector
// 
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
// 
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
   
(function($) { 
    var JFMFS = function(element, options) {
        var elem = $(element),
            obj = this,
            uninitializedImagefriendElements = [], // for images that are initialized
            keyUpTimer,
            friend_container = ;
            
        var settings = $.extend({
            max_selected: -1,
            max_selected_message: "{0} of {1} selected",
            init_callback: function() {},
            onchange_callback: function(selectedIds) {}
        }, options || {});
        var lastSelected;  // used when shift-click is performed to know where to start from to select multiple elements
                
        
        // ----------+----------+----------+----------+----------+----------+----------+
        // Initialization of container
        // ----------+----------+----------+----------+----------+----------+----------+
        elem.html(
            "<div id='jfmfs-friend-selector'>" +
            "    <div id='jfmfs-inner-header'>" +
            "        <span class='jfmfs-title'>Find Friends: </span><input type='text' id='jfmfs-friend-filter-text' value='Start typing a name'/>" +
            "        <a class='filter-link selected' id='jfmfs-filter-all' href='#'>All</a>" +
            "        <a class='filter-link' id='jfmfs-filter-selected' href='#'>Selected (<span id='jfmfs-selected-count'>0</span>)</a>" +
            ((settings.max_selected > 0) ? "<div id='jfmfs-max-selected-wrapper'></div>" : "") +
            "    </div>" +
            "    <div id='jfmfs-friend-container'></div>" +
            "</div>" 
        );
            
        FB.api('/me/friends?fields=id,name', function(response) {
            var sortedFriendData = response.data.sort(function(a, b) {
                var x = a.name.toLowerCase();
                var y = b.name.toLowerCase();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
            
            
            
            $.each(sortedFriendData, function(i, friend) {
                $("#jfmfs-friend-container").append("<div class='jfmfs-friend' id='" + friend.id  +"'><img/><div class='friend-name'>" + friend.name + "</div></div>");
            
                $("#" + friend.id, elem).bind('inview', function (event, visible) {
                    if( $(this).attr('src') == undefined)
                        $("img", $(this)).attr("src", "//graph.facebook.com/" + friend.id + "/picture");
                });
            
            });
            
            uninitializedImagefriendElements = $(".jfmfs-friend", elem);            
            init();
        });
        
        
        // ----------+----------+----------+----------+----------+----------+----------+
        // Public functions
        // ----------+----------+----------+----------+----------+----------+----------+
        
        this.getSelectedIds = function() {
            var ids = [];
            $.each(elem.find(".jfmfs-friend.selected"), function(i, friend) {
                ids.push($(friend).attr("id"));
            });
            return ids;
        };
        
        this.getSelectedIdsAndNames = function() {
            var selected = [];
            $.each(elem.find(".jfmfs-friend.selected"), function(i, friend) {
                selected.push( {id: $(friend).attr("id"), name: $(friend).find(".friend-name").text()});
            });
            return selected
        };
        
        this.clearSelected = function () {
            $(".jfmfs-friend").removeClass("selected");
        };
        
        // ----------+----------+----------+----------+----------+----------+----------+
        // Private functions
        // ----------+----------+----------+----------+----------+----------+----------+
        
        var init = function() {
            // handle when a friend is clicked for selection
            elem.find(".jfmfs-friend").live('click', function(event) {
                
                // if the element is being selected, test if the max number of items have
                // already been selected, if so, just return
                if(!$(this).hasClass("selected") && 
                    maxSelectedEnabled() &&
                    $(".jfmfs-friend.selected").size() >= settings.max_selected &&
                    settings.max_selected != 1)
                    return;
                    
                // if the max is 1 then unselect the current and select the new    
                if(settings.max_selected == 1)
                    elem.find(".selected").removeClass("selected");
                    
                $(this).toggleClass("selected");
                $(this).removeClass("hover");
                
                // support shift-click operations to select multiple items at a time
                if( $(this).hasClass("selected")) {
                    if ( !lastSelected ) {
                        lastSelected = $(this);
                    } 
                    else {                        
                        if( event.shiftKey ) {
                            var selIndex = $(this).index();
                            var lastIndex = lastSelected.index();
                            var end = Math.max(selIndex,lastIndex);
                            var start = Math.min(selIndex,lastIndex);
                            for(var i=start; i<=end; i++) {
                                var aFriend = $( $(".jfmfs-friend")[i] );
                                if(!aFriend.hasClass("hide-non-selected") && !aFriend.hasClass("hide-filtered"))
                                    if( maxSelectedEnabled() && $(".jfmfs-friend.selected").size() < settings.max_selected )
                                        $( $(".jfmfs-friend")[i] ).addClass("selected");
                            }
                        }
                    }
                }
                
                // keep track of last selected, this is used for the shift-select functionality
                lastSelected = $(this);
                
                // update the count of the total number selected
                $("#jfmfs-selected-count").html( selectedCount() );
                
                if( maxSelectedEnabled() ) {
                    updateMaxSelectedMessage();
                }
                
                settings.onchange_callback( obj.getSelectedIdsAndNames() );
            });

            // filter by selected, hide all non-selected
            elem.find("#jfmfs-filter-selected").live('click', function() {
                $(".jfmfs-friend").not(".selected").addClass("hide-non-selected");
                $(".filter-link").removeClass("selected");
                $(this).addClass("selected");
            });

            // remove filter, show all
            elem.find("#jfmfs-filter-all").live('click', function() {
                $(".jfmfs-friend").removeClass("hide-non-selected");
                $(".filter-link").removeClass("selected");
                $(this).addClass("selected");
            });

            // hover effect on friends
            elem.find(".jfmfs-friend:not(.selected)").live(
                'hover', function (ev) {
                    if (ev.type == 'mouseover') {
                        $(this).addClass("hover");
                    }
                    if (ev.type == 'mouseout') {
                        $(this).removeClass("hover");
                    }
                });

            // filter as you type 
            elem.find("#jfmfs-friend-filter-text")
                .keyup( function() {
                    var filter = $(this).val();
                    clearTimeout(keyUpTimer);
                    keyUpTimer = setTimeout( function() {
                        if(filter == '') {
                            $(".jfmfs-friend").removeClass("hide-filtered");
                        }
                        else {
                            $("#jfmfs-friend-selector").find(".friend-name:not(:Contains(" + filter +"))").parent().addClass("hide-filtered");
                            $("#jfmfs-friend-selector").find(".friend-name:Contains(" + filter +")").parent().removeClass("hide-filtered");                         
                        }    
                        showImagesInViewPort();                        
                    }, 400);
                })
                .focus( function() {
                    if($.trim($(this).val()) == 'Start typing a name')
                        $(this).val('');
                    })
                .blur(function() {
                    if($.trim($(this).val()) == '')
                        $(this).val('Start typing a name');                        
                    });

            // hover states on the buttons        
            elem.find(".jfmfs-button").hover(
                function(){ $(this).addClass("jfmfs-button-hover");} , 
                function(){ $(this).removeClass("jfmfs-button-hover");}
            );      
            
            // manages lazy loading of images
            var getViewportHeight = function() {
                var height = window.innerHeight; // Safari, Opera
                var mode = document.compatMode;

                if ( (mode || !$.support.boxModel) ) { // IE, Gecko
                    height = (mode == 'CSS1Compat') ?
                    document.documentElement.clientHeight : // Standards
                    document.body.clientHeight; // Quirks
                }

                return height;
            };
            
            var showImagesInViewPort = function() {
                var vpH = $("#jfmfs-friend-container").innerHeight() ,
                    scrolltop = $("#jfmfs-friend-container").scrollTop(),
                    filter = $("#jfmfs-friend-filter-text", elem).val();
                
                var foundVisible = false;
                $.each(uninitializedImagefriendElements, function(i, $el){
                    if($el != null) {
                        var $el = $( uninitializedImagefriendElements[i] ),
                            top = $el.offset().top - $el.parent().offset().top,                        
                            height = $el.height();
                        if (top+height >= -10 && top-height < vpH) {  // give some extra padding for broser differences
                                $el.data('inview', true);
                                $el.trigger('inview', [ true ]);
                                foundVisible = true;
                                uninitializedImagefriendElements[i] = null; 
                        } 
                        else {
                            if(foundVisible) return false;
                        }                            
                    }              
                });
            };

            $("#jfmfs-friend-container").bind('scroll', function () {
                showImagesInViewPort();
            });

            updateMaxSelectedMessage();                      
            settings.init_callback();
            // there's a race condition with the colorbox and the images actually
            // being in the viewport, so just set a timer 
            setTimeout(showImagesInViewPort, 1000);
        };

        var selectedCount = function() {
            return $(".jfmfs-friend.selected").size();
        }

        var maxSelectedEnabled = function () {
            return settings.max_selected > 0;
        }
        
        var updateMaxSelectedMessage = function() {
            var message = settings.max_selected_message.replace("{0}", selectedCount()).replace("{1}", settings.max_selected)
            $("#jfmfs-max-selected-wrapper").html( message );
        }
        
    };
    

    
    $.fn.jfmfs = function(options) {
        return this.each(function() {
            var element = $(this);
            
            // Return early if this element already has a plugin instance
            if (element.data('jfmfs')) return;
            
            // pass options to plugin constructor
            var jfmfs = new JFMFS(this, options);
            
            // Store plugin object in this element's data
            element.data('jfmfs', jfmfs);
            
        });
    };
    
    // todo, make this more ambiguous
    jQuery.expr[':'].Contains = function(a, i, m) { 
      return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0; 
    };
        

})(jQuery);
