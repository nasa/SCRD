/*
    Copyright 2014 OPM.gov

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

// The interval to retrieve notifications in seconds
var notificationsInterval = 50;
// The auto search interval
var autoSearchInterval = 2;
// The last notifications in days
var notificationsInLastDays = 15;
// The new version number
var versionNum = 1;
// current logged in user object
window.user = null;
// calculation result cache
window.results = {};

var intLimit32 = 2147483647;

/**
 * This function check whether or not a string represents
 * a valid number integer or decimal
 * @param {string} n a number
 * @return true if it is a valid number
 */
var isNumber = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * This function checks whether or not a string represents a
 * valid integer
 * @param n a number
 * @return true if it is a valid integer
 */
var isInteger = function (n) {

    return isNumber(n) && parseInt(n, 10) === parseFloat(n);
};

/**
 *  This function checks whether or not an object is null
 * @param {object} obj the object 
 * @return true if the object is null, false otherwise
 */
var isNull = function (obj) {

    if (obj === null || obj === undefined) {
        return true;

    }

    return false;

};


/**
* Manual sorting a table.
* @param tab the table to sort, jquery object
*/
function manualSort(tab){

    /*var elem = $('#suspenseTbl thead th .current .sortheader .sortarrow');

    elem.toggleClass('sort-down');
    if(elem.attr('sortdir') == 'down'){
        elem.attr('sortdir', 'up');
    }else if(elem.attr('sortdir') == 'up'){
        elem.attr('sortdir', 'down');
    }*/

    $('thead th.current', tab).click();
    $('thead th.current', tab).click();
}

$(document).ready(function() {
    europeandate = false;
    var context = $('#context').val();
    $(document).ajaxStart(function() {
        $("#loadingOverlay").show();
    });
    $(document).ajaxStop(function() {
        $("#loadingOverlay").hide();
    });

    // enable the tabs in tables
    $("table").each(function() {
        $(this).attr('tabindex', 0);
    });

    // add the tabindex for header and rows
    $("table").focusin(function() {
        $(this).find("thead th").each(function() {
            $(this).attr('tabindex', 0);
        });
        $(this).find("tbody tr").each(function() {
            $(this).attr('tabindex', 0);
        });
    });
    $("body").delegate("tr", "focusin", function() {
        $(this).addClass("hovered");
    });
    $("body").delegate("tr", "focusout", function() {
        $(this).removeClass("hovered");
    });
    $("body").delegate("th", "focusin", function() {
        $(this).addClass("hovered");
    });
    $("body").delegate("th", "focusout", function() {
        $(this).removeClass("hovered");
    });
    $("body").delegate("tr", "keyup", function(event) {
         var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == 13) {
            // enter
            var clicked = false;
            $(this).find("td").each(function() {
                if (!$(this).hasClass("checkCell") && !clicked) {
                    clicked = true;
                    $(this).click();
                    return;
                }
            });
            
            event.preventDefault();
            return false;
        }
        return true;
    });
    $("body").delegate("th", "keyup", function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == 13) {
            $(this).click();
            return false;
        }
        return true;
    });
    
    $("body").delegate(".priBtn", "keyup", function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == 13) {
            event.preventDefault();
            // enter
            $(this).click();
            
            return false;
        }
        return true;
   });

    if ($(".addPaymentPopup").length > 0) {
        loadLookup('applicationDesignations', false);
        // update the paymentAppliance
        $.ajax({
            url:'lookup/paymentAppliances',
            type: 'GET',
            cache: false,
            async: true,
            global: false,
            success:function(data) {
                $('#paymentAppliance').html('');
                // <input name="addPaymentType" type="radio" id="ppr" value="ppr" checked="checked"/>
                // <label class="radioLabel longLabel" for="ppr">Prior Payment Recorded</label>
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    var theOption = $('<p></p>');
                    var theId = 'addPaymentAppliance_' + i;
                    var theInput = $('<input name="addPaymentAppliance" type="radio" id="' + theId + '"/>');
                    if (i == 0) {
                        theInput.prop('checked', true);
                    }
                    theInput.val(item.id);
                    theOption.append(theInput);
                    var theLabel = $('<label class="radioLabel longLabel" for="' + theId + '">' + item.name + '</label>');
                    theOption.append(theLabel);
                    
                    $('#paymentAppliance').append(theOption);
                }
            },
            error:function() {
                
            }
            
        });
    }

    $(document).ajaxComplete(function(event, xhr, ajaxOptions) {
        // For ajax calling, the server only returns 200 status code
        // and json content for success calling.
        // If 302 or text/html content is returned, assumes that login expired
        if (xhr.status === 302) {
            window.location.reload();
        } else if (xhr.status === 200) {
            var contentType = xhr.getResponseHeader("Content-Type");
            if (contentType && contentType.toLowerCase().indexOf("text/html") >= 0) {
                window.location.reload();
            }
        }
    });



    // Get current user
    $.ajax({
        url: context + '/common/currentUser',
        type: 'GET',
        cache: false,
        async: false,
        global: false,
        success: function(userObj) {
            $('.welcomeMsg > span').text(userObj['firstName'] + ' ' + userObj['lastName']);
            $('.roleDesc').text(userObj['role']['description']);

            window.globalUserRoleName = userObj['role']['name'];
            window.globalUserRoleId = userObj['role']['id'];
            window.globalUserId = userObj['id'];
            window.globalUsername = userObj['username'];
            user = userObj;
            // Get new notifications for the user
            getNotifications();
        },
        error: function(request, status, error) {
            alert("Failed to get current user: " + request.responseText);
        }
    });



    function getNotifications() {
        $.ajax({
            url: context + '/common/notifications',
            type: 'POST',
            cache: false,
            async: true,
            global: false,
            contentType: 'application/json',
            data: '{"sortColumn":"date","sortOrder":"DESC","pageNumber":0,"pageSize":0,"sender":null,"read":false,"recipient":"' + window.globalUsername + '","recipientRole":{"name":"' + window.globalUserRoleName + '"}}',
            success: function(notificationsArray) {
                $('.jsShowNotifications .notificationNum > span > span').text(notificationsArray.length);

                $('.notificationPopup tbody').text('');

                $('.infoTblWrapper tbody .rowNoti').parent().parent().remove();

                var beginDateTime = (new Date()).getTime() - notificationsInLastDays * 86400000;
                for (var i in notificationsArray) {
                    var notificationObj = notificationsArray[i];
                    var dateValue = notificationObj['date'];

                    var notificationStr = '<tr><td>' + formatNotificationDate(dateValue) + '<br/>' + formatNotificationTime(dateValue) + '</td>'
                            + '<td>' + notificationObj['sender'] + '</td>' + '<td>' + notificationObj['details'] + '</td></tr>';

                    $(".notificationPopup tbody").append(notificationStr);

                    if (($('.infoNotiPopup .filerTab li a:eq(0)').hasClass("current") || $('.infoNotiPopup .filerTab li a:eq(1)').hasClass("current")) && (new Date(dateValue).getTime() > beginDateTime)) {
                        var notificationStr2 = '<tr><td><span class="rowNoti"></span>' + formatNotificationDate(dateValue) + '</td>'
                                + '<td>' + formatNotificationTime(dateValue) + '</td>'
                                + '<td class="lastCol">Notification from ' + notificationObj['sender'] + ':' + notificationObj['details'] + '</td></tr>';
                        $(".infoTblWrapper tbody").append(notificationStr2);
                    }
                }
            },
            error: function(request, status, error) {
                //alert("Failed to get notifications: " + request.responseText);
            }
        });

        // Call getNotifications repeatedly
        setTimeout(getNotifications, notificationsInterval * 1000);
    }

    function getErrors() {
        $.ajax({
            url: context + '/common/errors',
            type: 'POST',
            cache: false,
            async: true,
            global: false,
            contentType: 'application/json',
            data: '{"sortColumn":"date","sortOrder":"DESC","pageNumber":0,"pageSize":0}',
            success: function(errorsArray) {

                $('.infoTblWrapper tbody .rowErr').parent().parent().remove();

                var beginDateTime = (new Date()).getTime() - notificationsInLastDays * 86400000;
                for (var i in errorsArray) {
                    var errorObj = errorsArray[i];
                    var dateValue = errorObj['date'];

                    if (($('.infoNotiPopup .filerTab li a:eq(0)').hasClass("current") || $('.infoNotiPopup .filerTab li a:eq(2)').hasClass("current")) && (new Date(dateValue).getTime() > beginDateTime)) {
                        var errorStr = '<tr><td><span class="rowErr"></span>' + formatNotificationDate(dateValue) + '</td>' + '<td>' + formatNotificationTime(dateValue) + '</td>' + '<td class="lastCol">Error from System:' + errorObj['details'] + '</td></tr>';
                        $(".infoTblWrapper tbody").append(errorStr);
                    }
                }
            },
            error: function(request, status, error) {
                //alert("Failed to get errors: " + request.responseText);
            }
        });

        // Call getErrors repeatedly
        setTimeout(getErrors, notificationsInterval * 1000);
    }


    var lastAccountSearchFormChanged = new Date().getTime();
    var oldAccountSearchFilter = gatherAccountSearchFilterParam();
    $('.viewAccountSearchForm').on("keyup", function() {
        lastAccountSearchFormChanged = new Date().getTime();
        return true;
    });

    function sameFilter(filter1, filter2) {
        if (filter1.birthDate != filter2.birthDate) {
            return false;
        }
        if (filter1.ssn != filter2.ssn) {
            return false;
        }
        if (filter1.firstName != filter2.firstName) {
            return false;
        }
        if (filter1.lastName != filter2.lastName) {
            return false;
        }
        if (filter1.middleName != filter2.middleName) {
            return false;
        }
        if (filter1.claimNumber != filter2.claimNumber) {
            return false;
        }
        return true;
    }
    var filterIsSet = false;
    // activate auto search
    //setInterval(autoSearch, autoSearchInterval * 1000);


    // activate auto search
    // Bug Fix 2
    //setTimeout(autoSearch, autoSearchInterval * 1000);
    function autoSearch() {
        if (!(typeof accountViewPageFilterContent === 'undefined')) {
            if (accountViewPageFilterContent == null) {
                return;
            }
            oldAccountSearchFilter = accountViewPageFilterContent;
        }
        var filter = gatherAccountSearchFilterParam();
        if (sameFilter(oldAccountSearchFilter, filter)) {
            return;
        }
        var nowTime = new Date().getTime();
        if (nowTime - lastAccountSearchFormChanged < 2000) {
            return;
        }
        if (filter.birthDate || filter.ssn || filter.firstName || filter.lastName || filter.middleName || filter.claimNumber) {
            $.ajax({
                url: context + '/account/search',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(filter),
                success: function(data, text, xhr) {
                    window.location = context + '/account/view';
                },
                error: function(a, b, c) {
                    alert('fail to search accounts, message:' + a.responseText);

                }
            });
        }
    }


    function getInfos() {
        $.ajax({
            url: context + '/common/infos',
            type: 'POST',
            cache: false,
            async: true,
            global: false,
            contentType: 'application/json',
            data: '{"sortColumn":"date","sortOrder":"DESC","pageNumber":0,"pageSize":0}',
            success: function(infosArray) {
                $('.infoTblWrapper tbody .rowInfo').parent().parent().remove();

                var beginDateTime = (new Date()).getTime() - notificationsInLastDays * 86400000;
                for (var i in infosArray) {
                    var infoObj = infosArray[i];
                    var dateValue = infoObj['date'];

                    if (($('.infoNotiPopup .filerTab li a:eq(0)').hasClass("current") || $('.infoNotiPopup .filerTab li a:eq(3)').hasClass("current")) && (new Date(dateValue).getTime() > beginDateTime)) {
                        var infoStr = '<tr><td><span class="rowInfo"></span>' + formatNotificationDate(dateValue) + '</td>'
                                + '<td>' + formatNotificationTime(dateValue) + '</td>' + '<td class="lastCol">Info from System:' + infoObj['details'] + '</td></tr>';
                        $(".infoTblWrapper tbody").append(infoStr);
                    }
                }
            },
            error: function(request, status, error) {
                //alert("Failed to get infos: " + request.responseText);
            }
        });

        // Call getInfos repeatedly
        setTimeout(getInfos, notificationsInterval * 1000);
    }

    // If the info bar does not present, then no need to get errors/infos repeatedly
    if ($('.statusInfoBar').length > 0) {

        // Get errors
        getErrors();

        // Get infos
        getInfos();
    }

    if ($('.topNav > ul > li:eq(4)').is(':visible')) {
        // Get suspensions number
        $.ajax({
            url: context + '/common/countSuspensions',
            type: 'GET',
            cache: false,
            async: true,
            global: false,
            success: function(suspensionsNum) {
                $('.topNav > ul > li:eq(4) .notificationNum > span > span').text(suspensionsNum);
                $('.jsSuspensionNum').text(suspensionsNum);
            },
            error: function(request, status, error) {
                alert("Failed to get suspensions number: " + request.responseText);
            }
        });
    }

    if ($('.topNav > ul > li:eq(5)').is(':visible')) {
        // Get approval total
        $.ajax({
            url: context + '/common/approvalSummary',
            type: 'GET',
            cache: false,
            async: true,
            global: false,
            success: function(approvalObj) {
                $('.topNav > ul > li:eq(5) .notificationNum > span > span').text(approvalObj['totalCount']);
                $('#approvalPage .pendingPaymentCount > span > span').text(approvalObj['pendingPaymentCount']);
                $('#approvalPage .interestAdjustmentCount > span > span').text(approvalObj['interestAdjustmentCount']);
                $('#approvalPage .paymentMoveCount > span > span').text(approvalObj['paymentMoveCount']);
                if (approvalObj['pendingPaymentCount'] == 0) {
                    $('#approvalPage .pendingPaymentCount').hide();
                }
                if (approvalObj['interestAdjustmentCount'] == 0) {
                    $('#approvalPage .interestAdjustmentCount').hide();
                }
                if (approvalObj['paymentMoveCount'] == 0) {
                    $('#approvalPage .paymentMoveCount').hide();
                }
            },
            error: function(request, status, error) {
                alert("Failed to get approval summary: " + request.responseText);
            }
        });
    }

    if ($('.topNav > ul > li:eq(2)').is(':visible')) {
        // Get pending cases count
        getPendingCasesCount(context);
    }

    //mockup userroles
    //set userrole in cookie
    $(".userRoleList li a").click(function() {
        var roleId = $(this).attr("id");
        var roleName = $(this).text();
        setCookie("opm_userroleid", roleId);
        setCookie("opm_userrolename", roleName);
        if ((roleId == "userRole1") || (roleId == "userRole3") || (roleId == "userRole5") || (roleId == "userRole7") || (roleId == "userRole8") || (roleId == "userRole9") || (roleId == "userRole11") || (roleId == "userRole12") || (roleId == "userRole13")) {
            window.location = "index2.html";
        } else {
            window.location = "index.html";
        }
    });
    // calculate end date
    $('.jsSubmitHour').click(function() {
        var hour = $(this).prev('input').val();
        if (hour == '') {
            $('.endDateError').html('Please enter a non empty integer hour.');
            showPopup('.noEndDatePopup');
            return;
        } else if (hour > 10000000) {
            var popupTitle = "Enter Hours";
            var boxTitleItem = $(this).closest(".chartCalAreaBox2").find(".boxTitle");
            if (boxTitleItem.length > 0 && boxTitleItem.text().indexOf("Days") >= 0) {
                popupTitle = "Enter Days";
            }
            $('.noEndDatePopup .popupTitle').text(popupTitle);
            $('.endDateError').html('The value you provide is too large.');
            showPopup('.noEndDatePopup');
            return;
        } else if(!isInteger(hour)){
            $('.endDateError').html('Please enter a valid integer.');
            showPopup('.noEndDatePopup');
            return;
        } else if(parseInt(hour, 10) > intLimit32){
            $('.endDateError').html('Please enter an integer value lower or equal than '+intLimit32+'.');
            showPopup('.noEndDatePopup');
            return;
        }
        var type = $(this).parent('div').prev('div').children('select').val();
        var dateField = $(this).parent('div').next('div').children('strong');
        dateField.html('');
        $.ajax({
            url: context + '/account/calculateEndDate?value=' + hour + '&type=' + type,
            success: function(data, text, xhr) {
                $(dateField).html(data);
            },
            error: function(a, b, c) {
                $('.endDateError').html(a.responseText);
                showPopup('.noEndDatePopup');
            }
        });
    });

    $('.chartCalAreaBox1 select').change(function() {
        var title = $('.chartCalAreaBox2 p').eq(0);
        var value = this.value;
        if (value == 'DAY_260') {
            title.html('Enter Days:');
        } else {
            title.html('Enter Hours:');
        }

    });




    //mockup pagination
    $('.jsGoPrev').click(function() {
        var wrapper = $(this).parent();
        if ((!$(this).hasClass("paginationBtnDisabled")) && ($('.jsGoPage', wrapper).length > 1)) {
            var prevItem = $('.currentPage', wrapper).prev(".jsGoPage");
            if (prevItem.length < 1) {
                var prevItem = $('.currentPage', wrapper).prev().prev(".jsGoPage");
            }
            $('.jsGoPage', wrapper).removeClass("currentPage");
            prevItem.addClass("currentPage");
            $('.jsGoNext', wrapper).removeClass("paginationBtnDisabled");
            var currentIdx = parseInt(prevItem.text(), 10);
            if (currentIdx == 1) {
                $('.jsGoPrev', wrapper).addClass("paginationBtnDisabled");
            }
            var totalCount = parseInt($(".totalNum").text(), 10);
            var startNum = (currentIdx - 1) * 10 + 1;
            var endNum = currentIdx * 10;
            endNum = Math.min(totalCount, endNum);
        }
        $(".startNum").text(startNum);
        $(".endNum").text(endNum);
        showPaginationDot(wrapper);
    });
    $('.jsGoNext').click(function() {
        var wrapper = $(this).parent();
        if ((!$(this).hasClass("paginationBtnDisabled")) && ($('.jsGoPage', wrapper).length > 1)) {
            var nextItem = $('.currentPage', wrapper).next(".jsGoPage");
            if (nextItem.length < 1) {
                var nextItem = $('.currentPage', wrapper).next().next(".jsGoPage");
            }
            $('.jsGoPage', wrapper).removeClass("currentPage");
            nextItem.addClass("currentPage");
            $('.jsGoPrev', wrapper).removeClass("paginationBtnDisabled");
            var currentIdx = parseInt(nextItem.text(), 10);
            var totalIdx = parseInt($('.jsGoPage:last', wrapper).text(), 10);

            if (currentIdx == totalIdx) {
                $('.jsGoNext', wrapper).addClass("paginationBtnDisabled");
            }

            var totalCount = parseInt($(".totalNum").text(), 10);
            var startNum = (currentIdx - 1) * 10 + 1;
            var endNum = currentIdx * 10;
            endNum = Math.min(totalCount, endNum);
        }
        $(".startNum").text(startNum);
        $(".endNum").text(endNum);
        showPaginationDot(wrapper);
    });
    $('.jsGoPage').click(function() {
        var wrapper = $(this).parent();
        if ((!$(this).hasClass("currentPage")) && ($('.jsGoPage', wrapper).length > 1)) {
            $('.jsGoPage', wrapper).removeClass("currentPage");
            $(this).addClass("currentPage");
            $('.jsGoNext', wrapper).removeClass("paginationBtnDisabled");
            $('.jsGoPrev', wrapper).removeClass("paginationBtnDisabled");
            var currentIdx = parseInt($(this).text(), 10);
            var totalIdx = parseInt($('.jsGoPage:last', wrapper).text(), 10);
            if (currentIdx == 1) {
                $('.jsGoPrev', wrapper).addClass("paginationBtnDisabled");
            }
            if (currentIdx == totalIdx) {
                $('.jsGoNext', wrapper).addClass("paginationBtnDisabled");
            }

            var totalCount = parseInt($(".totalNum").text(), 10);
            var startNum = (currentIdx - 1) * 10 + 1;
            var endNum = currentIdx * 10;
            endNum = Math.min(totalCount, endNum);
        }
        $(".startNum").text(startNum);
        $(".endNum").text(endNum);
        showPaginationDot(wrapper);
    });


    /**
     * enable textbox with placeholder functionality
     * selector - the jQuery selector of the textbox
     * text - the placeholder text
     */
    var initPlaceHolder = function(selector) {

        $(selector).each(function(index, element) {
            var placeholderTxt = $(this).next(".placeholderTxt");
            if (placeholderTxt.length < 1) {
                //no need placeholder
            } else {
                var placeholderTxt = placeholderTxt.text();
                if ($(this).val() === "" || $(this).val() === placeholderTxt) {
                    $(this).addClass("showPlaceholder").val(placeholderTxt);
                } else {
                    $(this).removeClass("showPlaceholder");
                }
                $(this).on('focus', function() {
                    $(this).on('blur', function() {
                        $(this).unbind('blur', arguments.callee);
                        if ($(this).val() === '') {
                            $(this).val(placeholderTxt).addClass("showPlaceholder");
                        }
                    });
                    if ($(this).val() === placeholderTxt) {
                        $(this).val('').removeClass("showPlaceholder");
                    }
                });
            }
        });
    };
    initPlaceHolder("textarea.paymentNotes");
    initPlaceHolder("input.helpSearchInput");
    initPlaceHolder("input.birthDateInput");
    //top navigation hover
    $('.topNav li').mouseenter(function() {
        $(this).next("li").addClass("noSep");
    }).mouseleave(function() {
        $(this).next("li").removeClass("noSep");
        $('.topNav li.current').next("li").addClass("noSep");
    });
    $('.topNav li.current').next("li").addClass("noSep");

    //btn active style
    $("body").delegate(".priBtn", "mousedown", function() {
        if (!$(this).hasClass("priBtnDisabled")) {
            $(this).addClass("priBtnActive");
        }
    }).delegate(".priBtn", "mouseup mouseleave", function() {
        $(this).removeClass("priBtnActive");
    });

    $("body").delegate(".priHighBtn", "mousedown", function() {
        if (!$(this).hasClass("priHighBtnDisabled")) {
            $(this).addClass("priHighBtnActive");
        }
    }).delegate(".priHighBtn", "mouseup mouseleave", function() {
        $(this).removeClass("priHighBtnActive");
    });
    $("body").delegate(".paginationBtn", "mousedown", function() {
        if (!$(this).hasClass("paginationBtnDisabled")) {
            $(this).addClass("paginationBtnActive");
        }
    }).delegate(".paginationBtn", "mouseup mouseleave", function() {
        $(this).removeClass("paginationBtnActive");
    });

    //Input focus style
    $("body").delegate("input.text, textarea, select", "focus", function() {
        if (!$(this).is('[readonly]')) {
            $(this).addClass("focus").removeClass("error").parent(".selectWrapper").removeClass("selectWrapperError");
            var fieldRow = $(this).parents(".halfRowField");
            if ($(".error", fieldRow).length < 1) {
                $(".errorIcon", fieldRow).remove();
            }
        }

    }).delegate("input.text, textarea", "blur", function() {
        $(this).removeClass("focus");
    });


    //Close Popup
    $('.jsClosePopup').click(function() {
        closePopup();
    });

    //datepicker
    $("input.datePicker").each(function() {
        var theTitle = $(this).attr('title');
        if (theTitle == null || theTitle == "") {
            theTitle = "Choose a date";
        }
        //datepicker
        $(this).datepicker({
            showOn: "button",
            buttonImage: context + "/i/calendar.png",
            buttonImageOnly: true,
            changeMonth: true,
            buttonText:theTitle,
            changeYear: true, yearRange: "-100:+1"
        });
    });

    //datepicker
    $("input.birthDate2").datepicker({
        showOn: "button",
        buttonImage: context + "/i/calendar.png",
        buttonImageOnly: true,
        changeMonth: true,
        changeYear: true, yearRange: "-100:+1",
        buttonText: "Enter the date of birth."
    });

    //datepicker
    $("input.depositDate2").datepicker({
        showOn: "button",
        buttonImage: context + "/i/calendar.png",
        buttonImageOnly: true,
        changeMonth: true,
        changeYear: true, yearRange: "-100:+1",
        buttonText: "Enter the date of deposit."
    });

    //datepicker
    $("input.actualPayment2").datepicker({
        showOn: "button",
        buttonImage: context + "/i/calendar.png",
        buttonImageOnly: true,
        changeMonth: true,
        changeYear: true, yearRange: "-100:+1",
        buttonText: "Enter the date of the actual payment."
    });

    $('.chartValueDep').change(function(){

        $('.hourFieldDep').val("");

    });

    $('.chartValueRep').change(function(){

        $('.hourFieldRep').val("");

    });


    //Date Calculator Error Close
    $('.jsRetryCalc').click(function() {
        $(this).parent(".errorMask").hide();
    });

    //Show Status Info popup
    $('.jsShowStatusInfoPopup').click(function() {
        $(this).parent().hide();
        $('.infoNotiPopup .filerTab li a').eq(0).trigger("click");
        showPopup(".infoNotiPopup");
    });
    $('.jsShowStatusInfoPopup').off("click");

    //Info popup filer click
    $('.infoNotiPopup .filerTab li a').click(function() {
        var popup = $(this).parents(".popup").eq(0);
        var filter = $(this).attr("id");
        if (filter == "rowAll") {
            $(".infoNotiPopup #infoTbl tr").show();
            $(".infoNotiPopup #infoTbl tr td").show();
        } else {
            $(".infoNotiPopup #infoTbl tr").hide();
            $(".infoNotiPopup #infoTbl tr td").hide();
            var rows = $("td > ." + filter, popup).parent().parent();
            rows.show().find("td").show();
        }
        $('.infoNotiPopup .filerTab li a').removeClass("current");
        $(this).addClass("current");
    });

    $('.infoNotiPopup .jsClosePopup').click(function() {
        $(".statusInfoBar").show();
    });
    //Show Notification
    $('.jsShowNotifications').click(function() {
        showNoti(".notificationPopup");
    });

    $(window).resize(function() {
        if ($(".notificationPopup:visible").length > 0) {
            positionNoti();
        }
        if ($(".noValidMask:visible").length > 0) {
            positionNoValidMask();
        }
        if ($(".printScrollArea:visible").length > 0) {
            var winHeight = parseInt($(window).height(), 10);
            $(".printScrollArea:visible").css({
                maxHeight: (winHeight - 100)
            });
            var popup = $(".printScrollArea:visible").parents(".popup").eq(0);
            popup.css('display', 'block').css('margin', -popup.height() / 2 + 'px 0 0 ' + (-popup.width() / 2) + 'px');
        }
    });



    //Show tooltips
    $(".jsShowTips").hover(function() {
        showTooltips("If you checked this box, it will make this page the default page when you visit the application. ", $(this));
    }, function() {
        hideTooltips();
    });

    $(".jsShowTips").focus(function() {
        showTooltips("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ac euismod augue. Maecenas tristique sit amet leo ut ullamcorper. Donec aliquam elementum erat sit amet fringilla.", $(this));
    });
    $(".jsShowTips").focusout(function() {
        hideTooltips();
    });

    //Seperate date input fields
    $(".datePickerInput").datepicker({
        showOn: "both",
        buttonImage: context + "/i/calendar.png",
        buttonImageOnly: true,
        changeMonth: true,
        changeYear: true, yearRange: "-100:+1",
        buttonText: "Enter the birth date.",
        beforeShow: function(input, inst) {
            setTimeout(function() {
                inst.dpDiv.css({
                    marginTop: 22
                });
            }, 0);
        },
        onSelect: function(dateText, inst) {
            //dateText comes in as MM/DD/YY
            var datePieces = dateText.split('/');
            var month = datePieces[0];
            var day = datePieces[1];
            var year = datePieces[2];
            var wrapper = inst.input.parent().parent();
            //define select option values for corresponding element
            $('.dpMonth', wrapper).val(month).removeClass("showPlaceholder");
            $('.dpDay', wrapper).val(day).removeClass("showPlaceholder");
            $('.dpYear', wrapper).val(year).removeClass("showPlaceholder");
        }
    });

    //Init datepicker setDate
    $(".datePickerInput").each(function(index, element) {
        var wrapper = $(this).parents("fieldRow").eq(0);
        var nYear = parseInt($('.dpYear', wrapper).val(), 10);
        var nMonth = parseInt($('.dpMonth', wrapper).val(), 10);
        var nDay = parseInt($('.dpDay', wrapper).val(), 10);
        var nDate = new Date(nYear, (nMonth - 1), nDay);

        if (isDate(nMonth + '/' + nDay + '/' + nYear)) {
            $('.datePickerInput', wrapper).datepicker('setDate', nDate);
        }
    });

    //Manually updated date
    $('.dpYear, .dpMonth, .dpDay').change(function() {
        if (isNaN($(this).val())) {
            $(this).val("");
        }
        var wrapper = $(this).parent();
        var nYear = parseInt($('.dpYear', wrapper).val(), 10);
        var nMonth = parseInt($('.dpMonth', wrapper).val(), 10);
        var nDay = parseInt($('.dpDay', wrapper).val(), 10);
        var nDate = new Date(nYear, (nMonth - 1), nDay)

        if (isDate(nMonth + '/' + nDay + '/' + nYear)) {
            $('.datePickerInput', wrapper).datepicker('setDate', nDate);
        }
    });

    //Click top nav view account button
    $('.jsShowSearchAccountPanel').click(function() {
        $(".viewAccountSearchFormWrapper").show();
        $(".topNav").addClass("showingSearchAccountPanel");
        $(".topNav li.current").addClass("tCurrent").removeClass("current");
        $(".topNav li").removeClass("noSep");
        $(".viewAccountSearchFormWrapper #claimNumberL").focus();
    });


    //index page
    if ($(".jsShowViewAccountOverlay").length > 0) {
        $(".jsShowSearchAccountPanel").trigger("click");
    }

    //Hide Search Account Panel
    $('.jsCloseViewAccount, .jsCancelSearchAccount').click(function() {
        $(".viewAccountSearchFormWrapper").hide();
        $(".topNav").removeClass("showingSearchAccountPanel");
        $(".topNav li.tCurrent").addClass("current").removeClass("tCurrent");
        $(".topNav li.current").next("li").addClass("noSep");
    });

    //Search Account Btn click
    $('.jsSearchAccount').click(function() {
        var searchPanel = $(this).parents(".viewAccountSearchForm").eq(0);
        $(".noRecordMsg", searchPanel).hide();
        var filter = gatherAccountSearchFilterParam();
        $.ajax({
            url: context + '/account/search',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(filter),
            success: function(data, text, xhr) {
                window.location = context + '/account/view';
            },
            error: function(a, b, c) {
                alert('Fail to search account, message:' + a.responseText);
            }
        });
    });

    $(".viewAccountSearchForm input[type=text]").val("");
    $(".viewAccountSearchForm input[type=checkbox]").prop("checked", false);
    //Search Account Btn click
    $('.jsClearSearchAccount').click(function() {
        $.ajax({
            url: context + '/account/search/history/clear',
            type: 'POST',
            success: function(data) {
                // good
            },
            error: function(a) {
                alert('Fail to clear search history : ' + a.responseText);
            }
        });
        var searchPanel = $(this).parents(".viewAccountSearchForm").eq(0);
        $(".noRecordMsg", searchPanel).hide();
        $("input[type=text]", searchPanel).val("");
        $("input[type=checkbox]", searchPanel).prop("checked", false);
    });

    //Step 2 Validate Entries
    $(".jsValidateEntries").click(function() {
        validateCalculationEntry(this);



    });
    var vEmpty = $(".validateResultTbl tbody").eq(0).html();
    var vSuccess = $(".validateResultTbl tfoot").eq(0).html();
    $(".jsRunCalculation").click(function() {
        //$(".jsCancelFunction", tab).hide();
        //$(".jsTriggerBill", tab).hide();
        var tab = $(this).parents(".tabsBlock").eq(0);


        var interestDateSave = $(".validationStatusBar .interestCalculatedToDate", tab).val(); // should be removed when interestCalculatedToDate become readonly
        $(".jsCancelFunction", tab).trigger("click");
        $(".validationStatusBar .interestCalculatedToDate", tab).val(interestDateSave); // should be removed when interestCalculatedToDate become readonly
        if (validateCalculationEntry(this) == false) {
            return false;
        }
        
        runCalculation(context, tab, false, runCalculationCallBack);

    });
    $(".jsSaveCalculation").click(function() {
        var tab = $(this).parents(".tabsBlock").eq(0);
        var interestDateSave = $(".validationStatusBar .interestCalculatedToDate", tab).val(); // should be removed when interestCalculatedToDate become readonly
        $(".jsCancelFunction", tab).trigger("click");
        $(".validationStatusBar .interestCalculatedToDate", tab).val(interestDateSave); // should be removed when interestCalculatedToDate become readonly
        if (validateCalculationEntry(this) == false) {
            return false;
        }
        runCalculation(context, tab, true, runCalculationCallBack);
        //if (runCalculation(context, tab, true) == false) {
            //return false;
        //}
        //$(".jsCancelFunction", tab).hide();
        //$(".jsTriggerBill", tab).show();
        //var result = $(".validationStatusBar .resultsVal", tab);
        //result.html("Calculation Saved").addClass("successLabel");
    });

    $(".jsTriggerBill").click(function() {
        var tab = $(this).parents(".tabsBlock").eq(0);
        var result = $(".validationStatusBar .resultsVal", tab);
        $.ajax({
            url: context + '/account/triggerBill',
            type: 'POST',
            success: function() {
                // Good
            },
            error: function(request, status, error) {
                alert('Failed trigger bill: ' + request.responseText);
            }
        });
        result.html("Calculation Triggered Pending").addClass("successLabel").removeClass('failLabel');
        $(this).hide();
    });

    $(".jsCancelFunction").click(function() {
        var tab = $(this).parents(".tabsBlock").eq(0);
        var tabName = tab.hasClass('depositTab') ? 'depositTab' : 'redepositTab' ;
        var id = $('.versionBar select', tab).val();
        var result = $(".validationStatusBar .resultsVal", tab);
        var status = $(".validationStatusBar .statusVal", tab);
        //var dateField = $(".validationStatusBar .calculateDate", tab); Removed in "OPM - Rules Engine - Integrate with Web App Assembly v1.0 "
        status.html("Unknown").removeClass("successLabel").removeClass('failLabel');
        result.html("Unknown").removeClass("successLabel").removeClass('failLabel');
        
        $(".validationStatusBar .interestCalculatedToDate", tab).val("");
                        
        //dateField.html("-"); Removed in "OPM - Rules Engine - Integrate with Web App Assembly v1.0 "
        $(".jsShowSample", tab).addClass("priBtnDisabled");
        $(".jsExpandCalculation", tab).addClass("priBtnDisabled");
        //$(".noValidMask", tab).show();
        $(".jsCancelFunction", tab).hide();
        $(".jsShowCalculation", tab).hide();
        $(".jsTriggerBill", tab).hide();
        var validTbl = $(".validateResultTbl", tab);
        if(id!= "" && results['r-' + id] && results['r-' + id].result){
            results['r-' + id].result.items = [];
        }
        $("tbody", validTbl).html(vEmpty);
        $(".valErrorRowCell", tab).removeClass("valErrorRowCell");
        $(".valErrorRowBefore", tab).removeClass("valErrorRowBefore");
        $(".valErrorRowAfter", tab).removeClass("valErrorRowAfter");
    });



    var editRowHTML = $(".entriesTbl tfoot").html();
    var viewRowHTML = '<tr class="even"><td class="blankCell firstCol">&nbsp;</td><td>01/01/2001</td><td>01/11/2012</td><td>CSRS</td><td>Deposit</td><td>Career</td><td>Wage Grade</td><td>$ 20,000.00</td><td class="lastCol">Refund/Lump Sum</td></tr>';
    var emptyRowHTML = '<tr class="even newEntryRow"><td class="blankCell firstCol">&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td class="lastCol"></td></tr>';
    //var emptyRowHTML = '<tr class="even2 newEntryRow unsortable"><td class="blankCell firstCol">&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td class="lastCol"></td></tr>';

    $(".jsNewVersionBtn").click(function() {
        var check = $(this).next('input').prop('checked');
        addNewVersion(this, check);
        

    });


    $('.depositTab .versionBar select').change(function() {

        if($(this).val() == ""){
            return;
        }

        // temp area
        var tempArea = $('.depositVersionTbodyArea');

        // calculation tab
        var tab = $('.depositTab');

        // the table
        var table = $('.entriesTbl', tab);


        // switch information between temp space
        var currentTbody = table.find('tbody').eq(0).addClass('isHidden');
        //var selectId = this.options[this.selectedIndex].value;
        var selectId = $(this).val();

        if(currentTbody.length != 0){           
            currentTbody.find('tr.entriesEditRow').children('td').eq(0).trigger('click');
            var id = currentTbody.prop('id');
            if(id){

                id = id.replace('tbody-', '');
                tempArea.find('tbody#tbody-' + id).remove();
                //  tempArea.find('#dateSpan-' + id).remove(); Removed in "OPM - Rules Engine - Integrate with Web App Assembly v1.0 "
                tempArea.find('#dateSpan-' + id).remove();
                tempArea.find('#statusSpan-' + id).remove();
                tempArea.find('#validationSpan-' + id).remove();
                tempArea.append(currentTbody);
                //  var copyDateSpan = dateSpan.clone().prop('id', 'dateSpan-' + id); Removed in "OPM - Rules Engine - Integrate with Web App Assembly v1.0 "
                //  tempArea.append(copyDateSpan); Removed in "OPM - Rules Engine - Integrate with Web App Assembly v1.0 "
                //var copyStatusSpan = statusSpan.clone().prop('id', 'statusSpan-' + id);
                var copyDateSpan = $('.interestCalculatedToDate', tab).clone().prop('id', 'dateSpan-' + id); 
                tempArea.append(copyDateSpan);

                var copyStatusSpan = $('.resultsVal', tab).clone().prop('id', 'statusSpan-' + id);
                tempArea.append(copyStatusSpan);
                //var copyValidationSpan = validationSpan.clone().prop('id', 'validationSpan-' + id);
                var copyValidationSpan = $('.statusVal', tab).clone().prop('id', 'validationSpan-' + id);
                tempArea.append(copyValidationSpan);

            }
            

        }

        $(tab).data('currentVersionId', selectId);
        


        var newId = $(this).val();
        var newTbody = $('#tbody-' + newId, tempArea).clone().removeClass('isHidden');
        table.find('tbody').remove();
        table.append(newTbody);
        //dateSpan.html($('#dateSpan-' + newId).html()); Removed in "OPM - Rules Engine - Integrate with Web App Assembly v1.0 "
        $('.interestCalculatedToDate', tab).val($('#dateSpan-' + newId, tempArea).val());
        //statusSpan.html($('#statusSpan-' + newId, tempArea).html());
        if($('#statusSpan-' + newId, tempArea).length > 0){
            $('.resultsVal', tab).replaceWith($('#statusSpan-' + newId, tempArea).clone().addClass('resultsVal'));
        }

        if($('#validationSpan-' + newId, tempArea).length >  0){
            $('.statusVal', tab).replaceWith($('#validationSpan-' + newId, tempArea).clone().addClass('statusVal'));
        }
        
        //validationSpan.html($('#validationSpan-' + newId, tempArea).html());
        
        decorateCalculationResult(tab);

        if (results['r-' + selectId] && results['r-' + selectId].result && results['r-' + selectId].result.items &&  results['r-' + selectId].result.items.length > 0) {
            populateCalculationItem(results['r-' + selectId].result, tab);
            populateCalculationResult(results['r-' + selectId].result, tab);
            $('.dollar').formatCurrency({
                negativeFormat: '%s-%n'
            });
        } else {
            //$('.jsCancelFunction', tab).trigger('click');           
            
            $(".validationStatusBar .interestCalculatedToDate", tab).val("");                                        
            $(".jsShowSample", tab).addClass("priBtnDisabled");
            $(".jsExpandCalculation", tab).addClass("priBtnDisabled");
            
            $(".jsCancelFunction", tab).hide();
            $(".jsShowCalculation", tab).hide();
            $(".jsTriggerBill", tab).hide();
            var validTbl = $(".validateResultTbl", tab);
            
            $("tbody", validTbl).html(vEmpty);
            $(".valErrorRowCell", tab).removeClass("valErrorRowCell");
            $(".valErrorRowBefore", tab).removeClass("valErrorRowBefore");
            $(".valErrorRowAfter", tab).removeClass("valErrorRowAfter");
        }

        // recreate the action row
        //recreateActionRow(statusSpan, tab);
        recreateActionRow($('.resultsVal', tab), tab);
    });

    $("body").delegate(".entriesTbl tbody td", "click", function() {
        if (!$(this).parents("table").eq(0).hasClass("entriesTblUnedit")) {
            var tr = $(this).parent("tr");
            if (($(this).hasClass("blankCell")) && (tr.hasClass("entriesEditRow"))) {
                tr.after($('#versionTableTemplate tbody tr').clone());
                var tds = $(tr).children('td');
                var newRow = $(tr).next();
                var ntds = $(newRow).children('td');
                $(ntds).eq(1).html($(tds).eq(1).children('input').val());
                $(ntds).eq(2).html($(tds).eq(2).children('input').val());
                $(ntds).eq(3).html($(tds).eq(3).children('select').get(0).options[$(tds).eq(3).children('select').get(0).selectedIndex].innerHTML);
                $(ntds).eq(3).next('input:hidden').val($(tds).eq(3).children('select').val());
                $(ntds).eq(4).html($(tds).eq(4).children('select').get(0).options[$(tds).eq(4).children('select').get(0).selectedIndex].innerHTML);
                $(ntds).eq(4).next('input:hidden').val($(tds).eq(4).children('select').val());
                $(ntds).eq(5).html($(tds).eq(5).children('select').get(0).options[$(tds).eq(5).children('select').get(0).selectedIndex].innerHTML);
                $(ntds).eq(5).next('input:hidden').val($(tds).eq(5).children('select').val());
                $(ntds).eq(6).html($(tds).eq(6).children('select').get(0).options[$(tds).eq(6).children('select').get(0).selectedIndex].innerHTML);
                $(ntds).eq(6).next('input:hidden').val($(tds).eq(6).children('select').val());
                $(ntds).eq(7).html($(tds).eq(7).children('input').val());
                $(ntds).eq(8).html($(tds).eq(8).children('select').get(0).options[$(tds).eq(8).children('select').get(0).selectedIndex].innerHTML);
                $(ntds).eq(8).next('input:hidden').val($(tds).eq(8).children('select').val());

                $(ntds).eq(9).html($(tds).eq(9).children('select').get(0).options[$(tds).eq(9).children('select').get(0).selectedIndex].innerHTML);
                $(ntds).eq(10).html($(tds).eq(10).children('select').get(0).options[$(tds).eq(10).children('select').get(0).selectedIndex].innerHTML);
                $(ntds).eq(11).html($(tds).eq(11).children('input').val());
                $('.dollar').formatCurrency({
                    negativeFormat: '%s-%n'
                });
            } else if (tr.hasClass("entriesEditRow")) {
                return;
            } else {
                tr.parent('tbody').children('tr.entriesEditRow').children('td').eq(0).trigger('click');
                var editRowHTML = $("#versionEditTemplate tbody tr").clone();
                var values = [];

                $.each($(tr).children('td'), function(i) {
                    if (i == 1 || i == 2) {
                        values.push($(this).html());
                    } else if (i == 7) {
                        values.push($(this).html().replace(/[^0-9\.]+/g, ""));
                    } else if (i == 9 || i == 10 || i == 11) {
                        values.push($(this).html());
                    } else {
                        values.push($(this).next('input:hidden').val());
                    }


                });
                tr.after(editRowHTML);
                var editingTr = $(tr).next('tr');
                var tds = $(editingTr).children('td');
                if (!tr.hasClass('newEntryRow')) {
                    $(tds).eq(1).children('input').val(values[1]);
                    $(tds).eq(2).children('input').val(values[2]);
                    $(tds).eq(3).children('select').get(0).selectedIndex = values[3];
                    $(tds).eq(4).children('select').get(0).selectedIndex = values[4];
                    $(tds).eq(5).children('select').get(0).selectedIndex = values[5];
                    $(tds).eq(6).children('select').get(0).selectedIndex = values[6];
                    $(tds).eq(7).children('input').val(values[7]);

                    $(tds).eq(8).children('select').get(0).selectedIndex = values[8];

                    $("select option", $(tds).eq(9)).each(function() {
                        if ($(this).html() == values[9]) {
                            $(this).attr('selected', true);
                        }
                    });
                    
                    $("select option", $(tds).eq(10)).each(function() {
                        if ($(this).html() == values[10]) {
                            $(this).attr('selected', true);
                        }
                    });
                    $(tds).eq(11).children('input').val(values[11]);


                } else {
                    $(tds).eq(3).children('select').get(0).selectedIndex = 2;
                    $(tds).eq(4).children('select').get(0).selectedIndex = 1;
                    $(tds).eq(5).children('select').get(0).selectedIndex = 2;
                    $(tds).eq(6).children('select').get(0).selectedIndex = 2;
                    $(tds).eq(7).children('input').val("20000.00");

                    $(tds).eq(8).children('select').get(0).selectedIndex = 5;
                }

                $(tds).eq(7).children('input').keypress(function(evt) {

                        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
                        
                        if (evt.which === 46) {
                            if (/\./.test($(this).val()) === true) {
                                evt.preventDefault();
                            }
                        } else if(!/^\d+$/.test(key)){ // Bug fix
                            event.preventDefault();
                            return false;
                        } else if (evt.which > 31) {
                            if (evt.which < 48 || evt.which > 57) {
                                evt.preventDefault();
                            } else {
                                var value = $(this).val();
                                var newVal = value + (evt.which - 48);
                                if (parseInt(newVal) > 100000000) {
                                    evt.preventDefault();
                                }
                            }
                        }
                });

                $(tds).eq(1).children('input').datepicker({
                    showOn: "button",
                    buttonImage: context + "/i/calendar.png",
                    buttonImageOnly: true,
                    changeMonth: true,
                    changeYear: true, yearRange: "-100:+1",
                    buttonText: "Enter the Begin Date."
                });
                $(tds).eq(2).children('input').datepicker({
                    showOn: "button",
                    buttonImage: context + "/i/calendar.png",
                    buttonImageOnly: true,
                    changeMonth: true,
                    changeYear: true, yearRange: "-100:+1",
                    buttonText: "Enter the End Date."
                });

                $(tds).eq(11).children('input').datepicker({
                    showOn: "button",
                    buttonImage: context + "/i/calendar.png",
                    buttonImageOnly: true,
                    changeMonth: true,
                    changeYear: true, yearRange: "-100:+1",
                    buttonText: "Enter the Interest Begin Date."
                });

                if (tr.hasClass("newEntryRow")) {
                    $(tr).parent('tbody').append(emptyRowHTML);
                }
            }
            var editRow = tr.next("tr");
            if (tr.hasClass("valErrorRow")) {
                editRow.addClass("valErrorRow");
            }
            if (tr.hasClass("valErrorRowBefore")) {
                editRow.addClass("valErrorRowBefore");
            }
            if (tr.hasClass("valErrorRowAfter")) {
                editRow.addClass("valErrorRowAfter");
            }
            tr.remove();

            $(window).trigger('resize');  // Bug Fix 1 Test

        }
    });

    $("body").delegate(".entriesEditRow input, .entriesEditRow select, tr.editing input, tr.editing select", "focus", function() {
        $(this).parents("td").eq(0).addClass("editingCell");
    }).delegate(".entriesEditRow input, .entriesEditRow select, tr.editing input, tr.editing select", "blur", function() {
        $(this).parents("td").eq(0).removeClass("editingCell");
    });

    $("body").delegate(".editingCell", "keydown", function(e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode == 9) {
            var tBody = $(this).parents("tbody").eq(0);
            var count = $("td", tBody).length - 1;
            var currentIdx = $("td", tBody).index($(this));
            if (currentIdx == count) {
                e.preventDefault();
                var editRowHTML = $(".entriesTbl tfoot").html();
                tBody.append(editRowHTML);
                var newRow = $("tr:last-child", tBody);
                $("input", newRow).val("");
                $(".bDate, .eDate, .iDate", newRow).addClass("datePicker");
                $("input.datePicker", newRow).datepicker({
                    showOn: "button",
                    buttonImage: context + "/i/calendar.png",
                    buttonImageOnly: true,
                    changeMonth: true,
                    changeYear: true, yearRange: "-100:+1"
                });
                $("select", newRow).each(function(index, element) {
                    $(this)[0].selectedIndex = 0;
                });
                newRow.addClass("newAddeeRow");
                $("td", newRow).addClass("newRowCellHidden").removeClass("editingCell").eq(1).removeClass("newRowCellHidden");
                // call custom function here
                $("input", newRow)[0].focus();
            }
            var nextCell = $(this).next("td");
            if (nextCell.hasClass("newRowCellHidden")) {
                nextCell.trigger("click");
            }
            if ($(".noValidMask:visible").length > 0) {
                positionNoValidMask();
            }
        }
    });
    $("body").delegate(".newRowCellHidden input", "focus", function() {
        $(this).parent().removeClass("newRowCellHidden");
    });
    $("body").delegate(".newRowCellHidden", "click", function(e) {
        $(this).removeClass("newRowCellHidden");
        if (e.hasOwnProperty('originalEvent')) {
            $("input", $(this)).show().focus();
            $("select", $(this)).show().focus();
        } else {
            if ($("input", $(this)).length > 0) {
                $("input", $(this)).show().get(0).click();
            } else if ($("select", $(this)).length > 0) {
                $("select", $(this)).show().get(0).click();
            }
        }
    });

    //Tabs click
    $(".tabsBar a").click(function() {
        var targetBlock = $(this).attr("id");
        //If tab has ID, switch tab display within same page
        if (!((typeof(targetBlock) == "undefined") || (targetBlock == ""))) {
            var bar = $(this).parents(".tabsBar").eq(0);
            $("a", bar).removeClass("current");
            $(this).addClass("current");
            var wrapper = bar.parent();
            $("> .tabsBlock", wrapper).hide();
            $("div." + targetBlock, wrapper).show();
            positionNoValidMask();
            $(".pageTitleArea .accountBtns .jsPrintStatement").hide();
            if (targetBlock === "employeeTab") {
                $(".pageTitleArea .accountBtns .jsPrintStatement").show();
            }
        }
    });

    //Expand/collapse Panel
    $(".jsTogglePanel").click(function() {
        $(this).toggleClass("panelExpanded");
        if ($(this).hasClass("panelExpanded")) {
            $(this).parent().find(".panelBody").show();
        } else {
            $(this).parent().find(".panelBody").hide();
        }
    });

    $(".jsTogglePanel").keypress(function(e){
        
        if(e.which == 13){
            
            $(this).click();
        }
        
        
    });

    if ($(".noValidMask:visible").length > 0) {
        positionNoValidMask();
    }


    /*$("#accountSearchResultTbl tbody td").mouseenter(function() {
        $(this).parent("tr").addClass("rowHover");
    }).mouseleave(function() {
        $(this).parent("tr").removeClass("rowHover");
    });*/

    $("#accountSearchResultTbl").delegate("td", "mouseenter", function() {
            $(this).parent().addClass("hovered");
            $(this).parent().addClass("rowHover");
    }).delegate("td", "mouseleave", function() {
            $(this).parent().removeClass("hovered");
            $(this).parent().removeClass("rowHover");
    });

    $('.accountNotesPanel tbody').delegate('td', 'mouseenter', function() {
        $(this).parent("tr").addClass("rowHover");
    });
    $('.accountNotesPanel tbody').delegate('td', 'mouseleave', function() {
        $(this).parent("tr").removeClass("rowHover");
    });


    //Delete Account version
    $(".jsDelVersionBtn").click(function() {
        if ($(this).hasClass('priBtnDisabled') == true) {
            return;
        }
        showPopup(".confirmDeletionPopup");
    });
    $(".jsConfirmDeletion").click(function() {
        var accountId = $('#accountId').val();
        closePopup();
        var tab = 'depositTab';
        var select = $('.' + tab + ' .versionBar select');
        var id = select.val();
        var type = 'calculationVersions';
        if (id.indexOf('new') == -1) {
            deleteVersion(context, accountId, type, id);
        }
        //select.find("option[value='" + id + "']").addClass('isHidden');
        select.find("option[value='" + id + "']").remove();
        /*var firstSee = -1;
        $.each(select.children('option'), function(i) {
            if ($(this).hasClass('isHidden') == false) {
                select.get(0).selectedIndex = i;
                firstSee = i;
                select.trigger('change');
            }
        });
        if (firstSee == -1) {*/
        if(select.val() == '') {
            select.text('');
            $("." + tab + " .jsDelVersionBtn").addClass('priBtnDisabled');
            $("." + tab + " .jsCancelFunction").trigger('click');
            $("." + tab + ' .jsNewVersionBtn').trigger('click');
        } else {
            select.change();
        }



    });

    $('.depositTab .jsRefreshGrid').click(function() {
        var accountId = $('#accountId').val();
        $('.depositVersionTbodyArea').html("");
        $('.depositTab  .entriesTbl tbody').remove();
        var account = getAccount(context, accountId);
        populateCalculationVersion(account);
        $('.depositTab .jsDelVersionBtn').removeClass('priBtnDisabled');
        $('.dollar').formatCurrency();
    });




    //Checkbox check all 
    $(".checkGroup").delegate('input[type=checkbox]', 'click', function(e) {
        e.stopPropagation();
        var checkGroup = $(this).parents(".checkGroup").eq(0);
        if ($(this).hasClass("checkAllRow")) {
            if ($(this).prop("checked")) {
                $(".checkRow", checkGroup).prop("checked", true);
            } else {
                $(".checkRow", checkGroup).prop("checked", false);
            }
        }
        if ($(this).hasClass("checkRow")) {
            var allCount = $(".checkRow", checkGroup).length;
            var checkedCount = $(".checkRow:checked", checkGroup).length;
            if (checkedCount == allCount) {
                $(".checkAllRow", checkGroup).prop("checked", true);
            } else {
                $(".checkAllRow", checkGroup).prop("checked", false);
            }
        }
    });

    //Payment notes
    $(".jsShowPHNote").click(function(e) {
        $(".paymentNotePopup .paymentNoteHint").html('Type your note and click "Save" or "Cancel"');
        showPopup(".paymentNotePopup ");
    });

    $(".paymentHistoryPanel .jsAddPayment").click(function() {
        $('.addPaymentPopup input[name="batchNum"]').val('');
        $('.addPaymentPopup input[name="blockNum"]').val('');
        $('.addPaymentPopup input[name="seqNum"]').val('');
        $('.addPaymentPopup input[name="paymentAmount"]').val('');
        $('.addPaymentPopup input[name="depositDate"]').val('');
        $('.addPaymentPopup input[name="addPaymentAppliance"][value=1]').prop('checked', true);
        showPopup(".addPaymentPopup ");
    });

    //$(".jsAddPayment").click(function() {
        //showPopup(".addPaymentPopup ");
    //});

    //Print Popups
    $(".jsPHReceipt").click(function(e) {
        showPopup(".printPaymentReceiptPopup");
    });
    $(".jsPrintAccountSummary").click(function(e) {
        showPopup(".printSummaryPopup");
    });
    $(".jsPrintFinalStatement").click(function(e) {
        showPopup(".printFinalStatementPopup");
    });

    $(".jsPrintStatement, .jsReprintStatement").click(function(e) {
        showPopup(".printStatementPopup");
    });


    //Do Print
    $(".jsDoPrintPaymentReceipt").click(function(e) {
        window.open('AccountDetails_PaymentHistory_PaymentReceipt_printview.html', 'PaymentReceipt', 'width=940,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
        return false;
    });
    $(".jsDoPrintAccountSummary").click(function(e) {
        window.open('AccountDetails_PrintSummary_printview.html', 'Summary', 'width=940,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
        return false;
    });
    $(".jsDoPrintFinalStatement").click(function(e) {
        window.open('AccountDetails_BillingSummary_PrintStatement_printview.html', 'FinalStatement', 'width=940,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
        return false;
    });
    $(".jsDoPrintStaement").click(function(e) {
        window.open('AccountDetails_PrintStatement_printview.html', 'Statement', 'width=940,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
        return false;
    });


    $("#paymentHistoryTbl .jsShowRowAction").click(function(e) {
        $("#paymentHistoryTbl .jsShowRowAction").removeClass("jsShowRowActionCellFocus");
        $(this).addClass("jsShowRowActionCellFocus");
        var position = $(this).offset();
        var w = parseInt($(this).width(), 10);
        $(".rowActions").show().css({
            top: position.top - 3,
            left: position.left + w - 5
        });
    }).mouseenter(function() {
        $(this).addClass("jsShowRowActionCellHover");
    }).mouseleave(function() {
        $(this).removeClass("jsShowRowActionCellHover");
    });

    $("#paymentHistoryTbl tbody td").dblclick(function() {
        $(".jsPHReceipt").trigger("click");
        clearSelection();
    });

    //hide menu
    $("body").click(function(e) {
        if (e.target.className.indexOf("jsShowRowAction") < 0) {
            $(".jsShowRowAction").removeClass("jsShowRowActionCellFocus");
            $(".rowActions").hide();
        }
    });


    //Adjust Payment Order
    $("body").delegate(".billingSummaryTab select.pOrder", "change", function() {

    });

    //Popups
    $(".jsShowSample").click(function(e) {
        if (!$(this).hasClass("priBtnDisabled")) {
            showPopup(".sampleInitialPopup");
        }
    });
    $(".jsShowCalculation").click(function(e) {
        showPopup(".confirmDatePopup");
    });
    $(".jsShowPeriodErrorPopup").click(function(e) {
        if(!isDate($('.confirmDatePopup .popupPadding .actualPayment2').val())){
            alert('The actual payment date is not in correct format mm/dd/yyyy.');
            return false;
        }
        closePopup();
        var errMsg2 = '<img src="'+ context + '/i/icon-error.png" alt="error" width="22" height="22" class="vMiddle" />';
        $('.periodErrorPopupMsg').html(errMsg2 + "The effective date for the refund is "+$('.confirmDatePopup .popupPadding .actualPayment2').val());
        showPopup(".periodErrorPopup");
    });
    $(".jsAddNote").click(function(e) {
        closePopup();
        $('.newnote textarea').val('');
        showPopup(".accountNotesAddPopup");
        $('.accountNotesAddPopup a.jsClipboardCopy').zclip({
            path: context + '/js/ZeroClipboard.swf',
            copy: function() {
                // Bug Fix 2
                //showPopup(".accountNoteCopyPopup");
                return $('.accountNotesAddPopup textarea').val();
            }
        });
    });
    $(".jsExpandCalculation ").click(function(e) {
        if (!$(this).hasClass("priBtnDisabled")) {
            var tab = $(this).parents('.tabsBlock').eq(0);

            var w = window.open(context + '/account/calculationResult', 'Calculation', 'width=1000,height=300,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
            function test(){
                w.document.getElementById('depTbl').innerHTML = $('.validateResultTbl', tab).html();
            }
            addEvent(w, 'load', test);
            return false;
        }
    });
    $(".jsUpdateInterest").click(function(e) {
        closePopup();
        showPopup(".updateInterestPopup");
    });
    $(".jsPHReversePayment").click(function(e) {
        // check if there is a row selected
        var selectedRow = $("#paymentHistoryTbl tbody tr.selectedRow");
        if (selectedRow.length == 0) {
            alert("You must select a row first.");
            return;
        }
        closePopup();
        showPopup(".reversePayementPopup");
        loadLookup('paymentReversalReasons', false, 2);
    });


    $(".jsLastUpdate").click(function(e) {
        ;
        closePopup();
        showPopup(".lastUpdatePopup");
    });

    $(".hourField").keypress(function(evt) {
        var charCode = (evt.which) ? evt.which : event.keyCode;
        return !(charCode > 31 && (charCode < 48 || charCode > 57));
    });
    $(".jsShowLastUpdateReport").click(function(e) {
        closePopup();
        showPopup(".updateInterestReportPopup");
    });

    // parse the format MM/dd/yyyy and return Date type
    function parseDateMMddyyyy(format) {
        var dateReg = /^((0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)?[0-9]{2})*$/;
        if (dateReg.test(format) && validateDateString(format)) {
            var date = new Date();
            date.setFullYear(format.split("/")[2]);
            date.setMonth(parseInt(format.split("/")[0]) - 1);
            date.setDate(format.split("/")[1]);
            date.setHours(0);
            date.setMinutes(0)
            date.setSeconds(0)
            date.setMilliseconds(0);
            //console.log(formatNotificationDate(date));
            return date;
        }
        
        return null;
    }

    function createPayment(payment, accountId) {
        var context = $('#context').val();
        //console.log("The context is: " + context);
        $.ajax({
        url: context + "/payment?resourceName=link&accountId=" + accountId,
        data: JSON.stringify(payment),
        async:false,
        contentType: 'application/json',
        headers: { 'Accept': 'application/json'},
        type: "POST",
        cache : false,
        success: function(data) {
        },

        error:function(jqXHR, textStatus,errorThrow){
            alert("Failed to create payment.");
        }
        }
        );
    }


    $("a.jsDoAddPHTransaction").on("click", function(event) {
        var entity = $.extend({}, $("tr.highlighted").data("data"));
        entity.batchNumber = $('div.addPaymentPopup input[name="batchNum"]').val();
        entity.blockNumber = $('div.addPaymentPopup input[name="blockNum"]').val();
        entity.sequenceNumber = $('div.addPaymentPopup input[name="seqNum"]').val();
        entity.amount = $('div.addPaymentPopup input[name="paymentAmount"]').val();
        if($.trim(entity.amount) === ''){
            alert("Enter a non empty amount number.");
            return;
        }
        if (!isNumber(entity.amount)) {
            alert("The amount should be a number.");
            return;
        }
        if($.trim(entity.batchNumber) === ''){
            alert("Enter a non empty batch number.");
            return;
        }
        if (!isInteger(entity.batchNumber)) {
            alert("The batch number should be a number.");
            return;
        }
        if($.trim(entity.blockNumber) === ''){
            alert("Enter a non empty block number.");
            return;
        }
        if (!isInteger(entity.blockNumber)) {
            alert("The block number should be a number.");
            return;
        }
        if (!isInteger(entity.sequenceNumber)) {
            alert("The sequence number should be a number.");
            return;
        }
        var depDate = $.trim($('div.addPaymentPopup input[name="depositDate"]').val());
        if (parseDateMMddyyyy(depDate === '' || $('div.addPaymentPopup input[name="depositDate"]').val()) == null) {
            alert("Deposit date must be mm/dd/yyyy.");
            return;
        }
        entity.depositDate = parseDateMMddyyyy($('div.addPaymentPopup input[name="depositDate"]').val()).getTime();

        //entity.applyTo = $('div.addPaymentPopup select[name="paymentApplyTo"]').find("option:selected").data("data");
        entity.applyTo = {
                id : $('div.addPaymentPopup select[name="paymentApplyTo"]').val()
        };
        
        //entity.paymentAppliance = $(".radioWrapper input:checked").data("data");
        entity.paymentAppliance = {
                id : $(".radioWrapper input:checked").val()
        }

        if (entity.paymentType == null) {
            entity.paymentType = "ORDINARY";
        }
        
        entity.id = null;
        if (entity.accountId == null && $('#accountId').length > 0) {
            entity.accountId = $('#accountId').val();
        }

        if (entity.accountId == null) {
            alert("This payment has no account attached.");
            return;
        }
        entity.applyToGL = $('#glApply').prop('checked');
        createPayment(entity, entity.accountId);
        closePopup();
        $('#paymentHistoryTbl').trigger("refreshPaymentTable");
    });


    $(".jsClosePopup2").click(function(e) {
        $(".alpha2, .popup2").hide();
    });
    $("input[name=addPaymentType]").click(function(e) {
        var popup = $(this).parents(".popup").eq(0);
        $(".addPaymentNote", popup).hide();
        $(".addPaymentNote_" + $(this).attr("id"), popup).show();
    });
    $(".jsPHDelPayment").click(function(e) {
        showPopup(".confirmPaymentDeletionPopup");
    });

    $(".jsDoSavePHNote").click(function(e) {
        // Bug Fix 2
        var popupHint = $(this).parents(".popup").eq(0).find(".paymentNoteHint");
        var noteN = $(this).parents(".popup").eq(0).find(".paymentNoteTextArea");
        if(noteN.data("note")){
            popupHint.text("Existing Note Updated.");
        } else{
            popupHint.text("New Note Saved.");
        }
        noteN.data("note", noteN.val());
        
    });

    $(".jsDoCancelPHNote").click(function(e) {

        var noteN = $(this).parents(".popup").eq(0).find(".paymentNoteTextArea");
        noteN.val(noteN.data("note"));
        closePopup();

    });

    $(".jsPHAuditHistory").click(function(e) {
        showPopup(".updateInterestReportPopup");
    });

    $("body").delegate(".alphaTrans", "click", function() {
        closePopup();
    });

    //Notes popup textarea resize
    $(".popup .notesRecord textarea").resizable({
        minWidth: 476,
        maxWidth: 476,
        minHeight: 172,
        resize: function() {
            var popup = $(this).parents(".popup").eq(0);
            popup.css('display', 'block').css('margin', -popup.height() / 2 + 'px 0 0 ' + (-popup.width() / 2) + 'px');
        }
    }).parent().css({
        "padding": "0 0 1px 0",
        height: 172
    });


    $("a.priBtn > span > span").each(function() {
        var title = $(this).text();
        $(this).closest("a.priBtn").prop("title", title);
    });

    $("select[typeName='countries']").on("change", function() {
        var theTitle = $("option:selected", $(this)).attr('title');
        $(this).attr('title', theTitle);
    });

    //Start Reports Page
    if ($("#reportsPage").length > 0) {
        //report page left tree
        if ($("#leftTree").length > 0) {
            $("#leftTree").treeview();
            var firstLevelNode = $("#leftTree > li");
            if (firstLevelNode.length === 1) {
                firstLevelNode.addClass("onlyNode");
            }
            equalizeReportHeight();

            //MOCKUP TREE NODE CLICKING, please remove
            $("#leftTree a").click(function() {
                var href = $(this).attr("href");
                if (href.indexOf(".html") < 0) {
                    var title = $(".rightReportWrapper h3.reportTitle")
                    var text = $(" > .file > .nodeText", $(this)).text();
                    title.text(text);
                    $("#leftTree a").removeClass("selected");
                    $(this).addClass("selected");
                }
            });
        }

        //reports page edit button
        $(".jsEditReport").click(function() {
            $(".jsEditReport, .viewReportWrapper").hide();
            $(".jsCancelSaveReport, .jsSaveReport, .editReportWrapper ").show();
            equalizeReportHeight();
        });

        //reports page cancel edit button
        $(".jsEditReportSaved ,.jsCancelSaveReport").click(function(e) {
            $(".jsCancelSaveReport, .jsSaveReport, .editReportWrapper ").hide();
            $(".jsEditReport, .viewReportWrapper").show();
            equalizeReportHeight();
            closePopup();
        });

        //reports page save button
        $(".jsSaveReport").click(function() {
            showPopup(".saveReportSuccessPopup");
        });

        //reports page print button
        $(".jsPrintReport").click(function() {
            showPopup(".sampleReportPlaceholderPopup");
        });

        //reports page delete button
        $(".jsDelReport").click(function() {
            showPopup(".deleteReportConfirmationPopup");
        });
    }
    //End Reports Page

    //Start Suspense Page
    if ( $("#suspensePage").length > 0 ){
        //init checkbox
        $("tbody input[name='postChkbx']").prop("checked", false);
        $("tbody input[name='postChkbx']").eq(0).prop("disabled", false);
        $("tbody input[name='postChkbx']").eq(1).prop("disabled", false);
        $("tbody input[name='postChkbx']").eq(2).prop("disabled", false);
        $("tbody input[name='postChkbx']").eq(3).prop("disabled", false);

        //Suspense Tbl
        $("#suspenseTbl").delegate("td", "mouseenter", function(){
            $(this).parent().addClass("hovered");
        }).delegate("td", "mouseleave", function(){
            $(this).parent().removeClass("hovered");
        });


        

        $("#suspenseTbl").delegate("input[name='postChkbx']", "click", function(){
            var checkBox = $("#suspenseTbl input[name='postChkbx']:checked:enabled");
            if (checkBox.length > 0){
                $(".jsPostCheckedPaymentsSuspense").removeClass("priBtnDisabled");
            }else{
                $(".jsPostCheckedPaymentsSuspense").addClass("priBtnDisabled");
            }
        });

        $(".jsTransferSuspense").click(function(){
            if (!($(this).hasClass("priHighBtnDisabled"))){
                showPopup(".transferSuspensePopup");
            }
        });

        $(".jsPrintSuspense").click(function(){
            showPopup(".currentSuspensePrintPopup");
        });

        $(".jsDoPrintCurrentSuspense").click(function(){
            window.open('Suspense_CurrentSuspense_printview.html','SuspenseCurrentSuspense','width=940,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
            return false;
        });

        $(".jsHistorySuspense").click(function(){
            showPopup(".suspenseHistoryPrintPopup");
        });

        $(".jsDoPrintSuspenseHistory").click(function(){
            window.open('Suspense_History_printview.html','SuspenseHistory','width=940,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
            return false;
        });

        $(".jsPostCheckedPaymentsSuspense").click(function(){
            if (!($(this).hasClass("priBtnDisabled"))){
                $(this).addClass("priBtnDisabled");
                var checkedBoxs = $("#suspenseTbl tbody input[name='postChkbx']:checked");
                checkedBoxs.each(function(){
                    var row = $(this).parents("tr").eq(0);
                    var txt= row.find("td").eq(2).text();
                    if ( txt.indexOf('Ready for ') > -1 ){
                        newTxt = txt.replace('Ready for ', '') + " - Pending Approval";
                    }else{
                        newTxt = "Posted - Pending Approval";
                    }
                    row.find("td").eq(2).html(newTxt);

                });
                var selectedRow = $("#suspenseTbl tr.highlighted");
                loadPaymentTransactionDetails(selectedRow);
                $(".jsResetSelectedPaymentSuspense").removeClass("priBtnDisabled");
            }
        });

        // should be removed.
        $(".jsResetSelectedPaymentSuspense").click(function(){
            if (!($(this).hasClass("priBtnDisabled"))){
                $(this).addClass("priBtnDisabled");
                var row = $("#suspenseTbl tbody tr.highlighted");
                $("input[name='postChkbx']", row).prop('checked', false).attr("disabled", false);
                row.find("td").eq(2).html("Suspended");
            }
        });

        // should be removed
        $(".jsLinkPaymentToCurrent").click(function(){
            if (!($(this).hasClass("priHighBtnDisabled"))){
                var selectedRow = $("#suspenseTbl tr.highlighted");
                var cells = selectedRow.find("td");
                $("input[name='postChkbx']", selectedRow).prop('checked', true);
                $(".jsPostCheckedPaymentsSuspense").removeClass("priBtnDisabled");
                loadPaymentTransactionDetails(selectedRow);
            }
        });

        $(".jsMakeThisEmpCur").click(function(){
            if (!($(this).hasClass("priHighBtnDisabled"))){
                if ($(".accountPanymentsWrapper input[name='csdNum']").hasClass("error")){
                    showPopup(".invalidCSDPopup");
                }
            }
        });

        $(".jsDoTransferSuspense").click(function(){
            var tpType = $("input[name='tpType']:checked").val();
            if ( tpType === "tpType1"){
                closePopup();
                showPopup(".refundCreditBalancePopup");
            }else{
                closePopup();
                var tpTypeTxt = $(".transferSuspensePopup input[name='tpType']:checked").next("label").text();
                $("#suspenseTbl tbody tr.highlighted td").eq(2).text("Ready for " + tpTypeTxt);
                $("#suspenseTbl tbody tr.highlighted input[name='postChkbx']").prop("checked", true);
                $(".jsPostCheckedPaymentsSuspense").removeClass("priBtnDisabled");
                if ( tpType !== "tpType4"){
                    alert("This action will normally open Microsoft Word, and display a document. For purposes of the wireframes, this is just a placeholder.");
                }
            }
        });

        $(".jsAlertOpenDoc").click(function(e){
            closePopup();
            var tpType = $(".transferSuspensePopup input[name='tpType']:checked").next("label").text();
            $("#suspenseTbl tbody tr.highlighted td").eq(2).text("Ready for " + tpType);
            $("#suspenseTbl tbody tr.highlighted input[name='postChkbx']").prop("checked", true);
            $(".jsPostCheckedPaymentsSuspense").removeClass("priBtnDisabled");
            alert("This action will normally open Microsoft Word, and display a document. For purposes of the wireframes, this is just a placeholder.");
        });

        $( ".paymentNotes" ).resizable({
            minWidth: 239,
            maxWidth: 239,
            minHeight: 237,
            resize: function() {
                var rHeight = $(".rightBox .boxInner").height();
                $(".leftBox .boxInner").height(rHeight);
            }
        }).parent().css("padding", "1");

        $(".jsSaveNoteSuspense").click(function(e){
            showPopup(".savePaymentNotesSuccessPopup");
        });

        $(".jsDiscardNoteChangesSuspense").click(function(){
            var form = $(this).parents("form").eq(0);
            var resetBtn = $("input[type='reset']", form);
            resetBtn.click();
            $("textarea", form).focus().blur();
        });
    }
    //End Suspense Page

    //Start Payments Page
    if ($("#paymentsPage").length > 0) {
        $("#paymentSearchResultsTbl tbody td").click(function() {
            var row = $(this).parent();
            $("#paymentSearchResultsTbl tbody tr").removeClass("highlighted");
            row.addClass("highlighted");
            $(".paymentSearchResultsBtnWrapper .priBtn").removeClass("priBtnDisabled");

        });

        $("#paymentSearchResultsTbl").delegate("td", "mouseenter", function() {
            $(this).parent().addClass("hovered");
        }).delegate("td", "mouseleave", function() {
            $(this).parent().removeClass("hovered");
        });

        $(".paymentSearchBox  select").each(function(index, element) {
            $(this)[0].selectedIndex = 0;
        });
        // Bug Fix 1
        //$(".jsSearchPayment").click(function() {
            //$(".paymentSearchResultsWrapper > div").show();
        //});
        $(".jsShowAuditTrail").click(function() {
            if (!($(this).hasClass("priBtnDisabled"))) {
                showPopup(".sampleReportPlaceholderPopup");
            }
        });
        $(".paymentSearchBox input#startDate").datepicker({
            showOn: "button",
            buttonImage: "i/calendar.png",
            buttonImageOnly: true,
            changeMonth: true,
            changeYear: true, yearRange: "-100:+1",
            buttonText: "Enter the start of the deposit date.",
            onClose: function(selectedDate) {
                $(".paymentSearchBox input#endDate").datepicker("option", "minDate", selectedDate);
            }
        });
        $(".paymentSearchBox input#endDate").datepicker({
            showOn: "button",
            buttonImage: "i/calendar.png",
            buttonImageOnly: true,
            changeMonth: true,
            changeYear: true, yearRange: "-100:+1",
            buttonText: "Enter the end of the deposit date.",
            onClose: function(selectedDate) {
                $(".paymentSearchBox input#startDate").datepicker("option", "maxDate", selectedDate);
            }
        });
    }
    //End Payments Page

    $('#bYearSearch').on('focus', function(){

        $('.viewAccountSearchFormWrapper .datePickerSep .ui-datepicker-trigger').click();

    });

    /*$('body').delegate('.ui-datepicker-trigger', 'focus', function(){

        $(this).click();

    });*/

}); //End document.ready


//Get pending cases count
function getPendingCasesCount(context) {
    $.ajax({
        url: context + '/workQueue/unassignedCases',
        type: 'POST',
        cache: false,
        async: true,
        global: false,
        contentType: 'application/json',
        data : JSON.stringify({}),
        success: function(casesArray) {
            $('.topNav > ul > li:eq(2) .notificationNum > span > span').text(casesArray.items.length);
        },
        error: function(request, status, error) {
            alert('Failed to get assigned cases: ' + request.responseText);
        }
    });
}

// Load lookup entities and populate the select drop-down options
function loadLookup(entityType, displayDiscription, defaultValue) {

    $.ajax({
        url: 'lookup/' + entityType,
        type: 'GET',
        cache: false,
        async: true,
        global: false,
        success: function(entities) {
            $('#' + entityType).text('');
            for (var i in entities) {
                var entity = entities[i];
                var option = $('<option></option>');
                option.text(displayDiscription ? entity.description : entity.name);
                option.val(entity.id);
                option.data('name', entity.name);
                $('#' + entityType).append(option);
            }
            if (defaultValue) {
                $('#' + entityType).val(defaultValue);
            }
        },
        error: function(request, status, error) {
            alert('Failed to get ' + entityType + ' : ' + request.responseText);
        }
    });
}

// Setup page
function setupPage(pageName, pageIndex) {

    // Set current page tab
    $('.topNav > ul > li:eq(' + pageIndex + ')').addClass('current');

    // Check home page
    checkHomePage(pageName);

    // Home page click handler
    $('#setHome').click(function() {
        setHomePage('' + pageName + '');
    });
}

// Switch tab (within page)
function switchTab(tabShowFunctions) {

    var tabLinks = $('.tabsBar a');
    tabLinks.click(function() {
        // Change breadcrumb title text when tab change

        var title = $(this).contents().filter(function() {
            return this.nodeType == 3;
        })[0].nodeValue;

        $('.breadcurmb span').text(title);
        $('.pageTitle').text(title);

        // If the tab is already shown
        if ($(this).data("tabShown")) {
            return;
        }

        // Set tab shown flag
        tabLinks.each(function() {
            $(this).data("tabShown", false);
        });
        $(this).data("tabShown", true);

        // Call tab show function
        tabShowFunctions[$(this).parent('li').index()]();
    });
}

//Check home page
function checkHomePage(page) {
    var context = $('#context').val();
    $.ajax({
        url: context + '/common/tab',
        type: 'GET',
        cache: false,
        async: true,
        global: false,
        success: function(homeTabPage) {
            if (homeTabPage == page) {
                $('#setHome').prop('checked', true);
            }
        },
        error: function(request, status, error) {
            alert('Failed to get home tab page: ' + request.responseText);
        }
    });
}

//Set home page
function setHomePage(homePage) {
    if (window.location.href.match(/account.*detail/)) {
        return;
    }
    var setHomeData = $('#setHome').prop("checked") ? homePage : 'null';
    var url = 'common/tab';
    if (setHomeData != 'null') {
    	url = 'common/tab?tab=' + setHomeData;
    }
    if (typeof rootUrl != 'undefined') {
    	url = rootUrl + url;
    }
    $.ajax({
        url: url,
        type: 'POST',
        cache: false,
        async: true,
        global: false,
        contentType: 'application/json',
        data: setHomeData,
        success: function() {
            // Good
        },
        error: function(request, status, error) {
            alert('Failed to make this tab as home page: ' + request.responseText);
        }
    });
}



//Format the date as MM/DD/YY hh:mm:ss
function formatFullDate(dateValue) {
    if (!dateValue) {
        return '';
    }
    var date = new Date(dateValue);
    var hours = date.getHours();
    return (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) + '/' + (date.getDate() < 10 ? '0' : '')
            + date.getDate() + '/' + date.getFullYear() + ' ' + (hours < 10 ? '0' : '') + hours + ':'
            + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
}

//Format the date as MM/DD/YY hh:mm AM|PM
function formatCaseDate(dateValue) {
    if (!dateValue) {
        return '';
    }
    var date = new Date(dateValue);
    var hours = date.getHours();
    var amOrPm = 'AM';
    if (hours > 12) {
        hours -= 12;
        amOrPm = 'PM';
    }
    return (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) + '/' + (date.getDate() < 10 ? '0' : '')
            + date.getDate() + '/' + date.getFullYear() + ' ' + (hours < 10 ? '0' : '') + hours + ':'
            + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ' ' + amOrPm;
}

// Format the date as MM/DD/YY
function formatNotificationDate(dateValue) {
    if (!dateValue) {
        return '';
    }
    var date = new Date(dateValue);

    return (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) + '/' + (date.getDate() < 10 ? '0' : '') + date.getDate() + '/' + date.getFullYear();
}
// Format the date as hh:mm:ss AM|PM
function formatNotificationTime(dateValue) {
    if (!dateValue) {
        return '';
    }
    var date = new Date(dateValue);

    var hours = date.getHours();
    var amOrPm = 'AM';
    if (hours > 12) {
        hours -= 12;
        amOrPm = 'PM';
    }
    return (hours < 10 ? '0' : '') + hours + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds() + ' ' + amOrPm;
}

function numberFormat(number, decimals, dec_point, thousands_sep) {
    var n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
            s = '',
            toFixedFix = function(n, prec) {
        var k = Math.pow(10, prec);
        return '' + Math.round(n * k) / k;
    };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}
;

//Change amount type of deposite field on payment search
function changeAmountType(obj) {
    checkValue = $(obj).val();
    var searchBox = $(obj).parents(".paymentSearchBox").eq(0);
    if (checkValue === "any") {
        $(".amountInput ", searchBox).addClass("fieldDisabled");
        $(".amountInput input", searchBox).prop("readonly", true);
        $(".amountInput input", searchBox).val("0.00");
    } else {
        $(".amountInput ", searchBox).removeClass("fieldDisabled");
        $(".amountInput input", searchBox).prop("readonly", false);
    }
}

//Change deposited date type of deposite field on payment search
function changeDepositedDate(obj) {
    checkValue = $(obj).val();
    var filedRow = $(obj).parents(".fieldRow").eq(0);
    if (checkValue === "between") {
        $(".singleDate", filedRow).addClass("isHidden");
        $(".betweenDate", filedRow).removeClass("isHidden");
        $("#startDate").val("01/01/2014");
        $("#endDate").val("02/02/2014");
    } else {
        $(".singleDate", filedRow).removeClass("fieldDisabled");
        $(".singleDate input", filedRow).prop("readonly", false);
        $(".singleDate", filedRow).removeClass("isHidden");
        $(".betweenDate", filedRow).addClass("isHidden");
        if (checkValue === "any") {
            $(".singleDate", filedRow).addClass("fieldDisabled");
            $(".singleDate input", filedRow).prop("readonly", true);
        } else{
            $('div.paymentSearchBox input[name="depositedDate"]').val("01/01/2014");
        }
    }
    if ((obj.selectedIndex === 1) || (obj.selectedIndex === 2) || (obj.selectedIndex === 3) || (obj.selectedIndex === 4) || (obj.selectedIndex === 5)) {
        filedRow.addClass("longSelect");
    } else {
        filedRow.removeClass("longSelect");
    }

    if (obj.selectedIndex === 0){
        $('div.paymentSearchBox input[name="depositedDate"]').val("");
        $("#startDate").val("");
        $("#endDate").val("");
    }

    if(checkValue == 'Deposited after' || checkValue == 'Deposited on or after' || checkValue == 'Deposited on'){
        $(".singleDate input", filedRow).datepicker( "option", "maxDate", new Date() );
    } else{
        $(".singleDate input", filedRow).datepicker( "option", "maxDate", null );
    }
}

function loadPaymentTransactionDetails(row){
    var cells = $(row).find("td");
    var pStatus = cells.eq(2).text();
    var tDate = cells.eq(3).text();
    var batBlkSeq = cells.eq(4).text();
    var tmp = batBlkSeq.split("-");
    var bat = tmp[0];
    var blk = tmp[1];
    var seq = tmp[2];
    var csd = cells.eq(5).text();
    var pAmount = cells.eq(7).text();
    var bDate = cells.eq(8).text();
    var scmName = cells.eq(9).text();
    var bAmount = cells.eq(10).text();
    var aStatus = cells.eq(11).text();

    $(".accountPanymentsWrapper input[name='csdNum']").removeClass("error");
    $(".accountPanymentsWrapper input[name='bDate']").removeClass("error");
    $(".accountPanymentsWrapper .errorIcon").remove();

    
    if ( pStatus.indexOf('Pending Approval') > -1 ){
        $(".jsTransferSuspense, .jsLinkPaymentToCurrent").addClass("priHighBtnDisabled");
    }
    if  ( pStatus === "" ){
        $(".jsLinkPaymentToCurrent, .jsMakeThisEmpCur, .jsTransferSuspense").addClass("priHighBtnDisabled");
    }
}

//Save Suspense Row
function saveSuspenseRow(row) {
    $("td", row).each(function() {
        if (row.hasClass("newRow")) {
            var cells = row.find("td");
            cells.eq(2).html("Unresolved");
            cells.eq(3).html("01/06/2013");
            cells.eq(4).html("183-51-62");
            cells.eq(5).html("8888888");
            cells.eq(7).html("$250.00");
            cells.eq(8).html("08/30/1987");
            cells.eq(9).html("");
            cells.eq(10).html("$0.00");
            cells.eq(11).html("");
            row.removeClass("newRow");
            $("input[type='checkbox']", row).attr("disabled", false);
            $(".jsPostCheckedPaymentsSuspense").removeClass("priBtnDisabled");
        } else {
            if ((!$(this).hasClass("checkBoxCell")) && (!$(this).hasClass("blankCell"))) {
                var cellVal = $("input.text", $(this)).val();
                $(this).html(cellVal);
            }
        }
    });
    row.removeClass("editing");
}

//Edit Suspense Row
function editSuspenseRow(row) {
    var tbl = row.parents("table").eq(0);
    $("tr", tbl).removeClass("highlighted").removeClass("hovered");
    ;
    var currentEditingRow = tbl.find(".editing");
    saveSuspenseRow(currentEditingRow);
    row.addClass("editing");
    $("td", row).each(function() {
        var w = parseInt($(this).width(), 10) - 16;
        if ((!$(this).hasClass("checkBoxCell")) && (!$(this).hasClass("blankCell"))) {
            var cellVal = $(this).text();
            if ($(this).hasClass("dateCellBirthDate2")) {
                $(this).html('<input type="text" value="' + cellVal + '" class="text birthDate2" style="width:' + (w - 6) + 'px"/>');
            } else if ($(this).hasClass("dateCellDepositDate2")) {
                $(this).html('<input type="text" value="' + cellVal + '" class="text depositDate2" style="width:' + (w - 6) + 'px"/>');
            } else {
                $(this).html('<input type="text" value="' + cellVal + '" class="text" style="width:' + w + 'px"/>');
            }
        }
    });
    if (row.hasClass("newRow")) {
        $("input[type='checkbox']", row).prop('checked', true).attr("disabled", true);
    }
    $(".datePicker", row).datepicker({
        showOn: "button",
        buttonImage: "i/calendar.png",
        changeMonth: true,
        changeYear: true, yearRange: "-100:+1",
        buttonImageOnly: true
    });
}
//Report page equalize height
function equalizeReportHeight() {
    if ($("#leftTree").length > 0) {
        var rightHeight = parseInt($(".rightReportWrapper").height(), 10);
        $(".leftTreeWrapper").css({
            "min-height": (rightHeight - 24)
        });
    }
}

//Position No Validation Mask
function positionNoValidMask() {
    $(".noValidMask:visible").each(function(index, element) {
        var mask = $(this);
        var target = $(this).prev("div");
        var p = target.position();
        mask.css({
            left: p.left,
            top: p.top,
            height: target.height()
        });
    });
}

// popup
// setup the popup tabindex
function setPopupTabIndex(popUpWindow, index) {
    var lastOne = null;
    var firstOne = null;
    if (index == null) {
        index = 0;
    }
    $("a.priBtn, input, textarea", popUpWindow).each(function() {
        if (firstOne == null) {
            firstOne = $(this);
        }
        index++;
        $(this).attr('tabindex', index);
        lastOne = $(this);
    });
    if (lastOne != null) {
        // if the lastOne is focus, reset the tabIndex
        lastOne.off("focusout");
        lastOne.on("focusout", function() {
            firstOne.focus();
        });
    }
    // focus on the first one
    if (firstOne != null) {
        setTimeout(function() {firstOne.focus();}, 100);
        
    }
}
/**
 * show popup
 * selector - the jQuery selector of the popup
 */
function showPopup(selector) {
    closePopup();
    var popup = $(selector);
    $('.alpha').css('display', 'block');
    var winHeight = parseInt($(window).height(), 10);
    if ($(".printScrollArea", popup).length > 0) {
        $(".printScrollArea", popup).css({
            maxHeight: (winHeight - 100)
        });
    }
    $('body').css('overflow','hidden');
    popup.css('display', 'block').css('margin', -popup.height() / 2 + 'px 0 0 ' + (-popup.width() / 2) + 'px');
    setPopupTabIndex(popup);
}
;
function closePopup() {
    $('.alpha').css('display', 'none').removeClass("alphaTrans");
    $('.popup').css('display', 'none');
    $('body').css('overflow','auto');
}
;
/**
 * show Notification Popup
 * selector - the jQuery selector of the popup
 */
function showNoti(selector) {
    var popup = $(selector);
    $('.alpha').css('display', 'block').addClass("alphaTrans");
    popup.css('display', 'block');
    positionNoti();
}
;
function positionNoti() {
    var popup = $(".notificationPopup");
    var target = $(".headerUserInfo .jsShowNotifications");
    var offset = target.offset();
    var h = parseInt(popup.height(), 10);
    var w = parseInt(popup.width(), 10);
    var tw = parseInt(target.width(), 10);
    popup.css('display', 'block').css({
        position: "absolute",
        top: ((parseInt(offset.top, 10) + 27) + 'px'),
        left: ((parseInt(offset.left, 10) - w + 3 + tw) + 'px')
    });
    $(".popupArrow", popup).css('display', 'block').css({
        position: "absolute",
        right: ((tw - 13) + 'px')
    });
}

//Show Tooltips
//@param str:
//    Tooltips string
//@target
//  Tooltips target object
function showTooltips(str, target) {
    $(".toolTips").remove();
    var offset = $(target).offset();
    var bd = $("body");
    bd.append("<div class='toolTips'>" + str + "<i></i></div>");
    var toolTips = $(".toolTips").eq(0);
    var h = toolTips.height();
    var w = toolTips.width();
    toolTips.css('top', (offset.top - h - 36) + 'px').css('left', (offset.left - w) + 'px');
}
function hideTooltips() {
    $(".toolTips").remove();
}


//Validate Date
function isDate(dateStr) {
    var datePat = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/;
    var matchArray = dateStr.match(datePat); // is the format ok?

    //Check format
    if (matchArray == null) {
        return false;
    }

    // p@rse date into variables
    month = matchArray[1];
    day = matchArray[3];
    year = matchArray[5];

    // check month range
    if (month < 1 || month > 12) {
        alert("Month must be between 1 and 12.");
        return false;
    }

    // check day range
    if (day < 1 || day > 31) {
        alert("Day must be between 1 and 31.");
        return false;
    }

    // check if month have 31 days
    if ((month == 4 || month == 6 || month == 9 || month == 11) && day == 31) {
        alert("Month " + month + " doesn`t have 31 days!")
        return false;
    }

    //check how much days for February of the year
    if (month == 2) {
        var isleap = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));
        if (day > 29 || (day == 29 && !isleap)) {
            alert("February " + year + " doesn`t have " + day + " days!");
            return false;
        }
    }

    // date is valid
    return true;
}

//Show pagination Dot
function showPaginationDot(wrapper) {
    var pageLinks = $(".jsGoPage", wrapper);
    $("span.fLeft", wrapper).remove();
    pageLinks.hide();
    totalCount = pageLinks.length;
    pageLinks.eq(0).show();
    pageLinks.eq(1).show();
    pageLinks.eq(2).show();
    pageLinks.eq(totalCount - 1).show();
    pageLinks.eq(totalCount - 2).show();
    pageLinks.eq(totalCount - 3).show();
    var currentPage = parseInt($(".currentPage", wrapper).eq(0).text(), 10);
    if ((currentPage > 2) && (currentPage < (totalCount - 1))) {
        pageLinks.eq(currentPage - 1).show();
        pageLinks.eq(currentPage - 2).show();
        pageLinks.eq(currentPage).show();
    }

    if ((currentPage < 3) && (totalCount > 6)) {
        pageLinks.eq(2).after('<span class="fLeft">...</span>');
    }
    if ((currentPage >= 3) && (currentPage <= 5) && (totalCount > 8)) {
        pageLinks.eq(currentPage).after('<span class="fLeft">...</span>');
    }
    if (currentPage > 5) {
        pageLinks.eq(2).after('<span class="fLeft">...</span>');
        if ((totalCount > 10) && (currentPage < totalCount - 4)) {
            pageLinks.eq(currentPage).after('<span class="fLeft">...</span>');
        }
    }
}


//input zipcode only
function validateZipInput(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode == 45) {
        return true;
    }
    return !(charCode > 31 && (charCode < 48 || charCode > 57));
}

//input phone only
function validatePhoneInput(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode == 40 || charCode == 41 || charCode == 43 || charCode == 45) {
        return true;
    }
    return !(charCode > 31 && (charCode < 48 || charCode > 57));
}

// input number only
function validateNumberInput(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    return !(charCode > 31 && (charCode < 48 || charCode > 57));

}

//clear text selection
function clearSelection() {
    var sel;
    if (document.selection && document.selection.empty) {
        document.selection.empty();
    } else if (window.getSelection) {
        sel = window.getSelection();
        if (sel && sel.removeAllRanges)
            sel.removeAllRanges();
    }
}

//cookies
function setCookie(name, value) {
    var exp = new Date();
    exp.setTime(exp.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}
function getCookie(name) {
    var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
    if (arr != null)
        return unescape(arr[2]);
    return null;
}
function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null)
        document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}
function post_to_url(path, params, method) {
    method = method || "post"; // Set method to post by default, if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for (var key in params) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);

        form.appendChild(hiddenField);
    }

    document.body.appendChild(form);    // Not entirely sure if this is necessary
    form.submit();
}

function gatherAccountSearchFilterParam() {
    var filter = {};
    $.each($('.viewAccountSearchForm input.filter:text').serializeArray(), function() {
        if ($.trim(this.value) !== '') {
            var str = this.value;
            str = str.replace(/\%/g, '\\%');
            str = str.replace(/\</g, '');
            str = str.replace(/\>/g, '');
            str = str.replace(/\"/g, '');
            str = str.replace(/\'/g, '');
            filter[this.name] = str;
        }

    });
    var ssn = $('.viewAccountSearchForm input.ssn:text').serializeArray();
    var ssnStr = $.trim(ssn[0].value) + '-' + $.trim(ssn[1].value) + '-' + $.trim(ssn[2].value);
    if (ssnStr !== '--') {
        filter.ssn = ssnStr;
    }
    var birthDate = $('.viewAccountSearchForm input.date:text').serializeArray();
    var dateString = $.trim(birthDate[0].value) + '/' + $.trim(birthDate[1].value) + '/' + $.trim(birthDate[2].value);
    if (dateString !== '//') {
        filter['birthDate'] = Date.parse(dateString);
    }
    filter.excludeHistory = $('#excludeFromSearch').prop('checked');
    filter.pageNumber = 1;
    filter.pageSize = 10;
    filter.assigned = null;
    filter.sortColumn = 'claimNumber';
    filter.sortOrder = 'DESC';
    return filter;
}

function populateNamedEntity(typeName, context, callback, noSelect) {

    $.ajax({
        url: context + '/lookup/' + typeName,
        dataType: 'json',
        async: false,
        success: function(data, status) {
            var html = "";
            if (noSelect === undefined) {
                html += "<option value='0' selected='selected'>Select</option>";
            }
            for (i = 0; i < data.length; i++) {
                html += "<option value='" + data[i].id + "' title='" + data[i].name + "'";
                if (i === 0 && noSelect) {
                    html += " selected='selected'";
                }
                html += '>' + data[i].name + "</option>";
            }
            $("select[typeName='" + typeName + "']").html(html);
            if (callback) {
                callback();
            }
        },
        error: function(a, b, c) {

        }
    });
}

function parseDateToString(item) {
    var date = new Date(item);
    return two(date.getMonth() + 1) + "/" + two(date.getDate()) + "/" + date.getFullYear();
}

function two(value) {
    if (value > 9) {
        return '' + value;
    }
    return '0' + value;
}

function refreshAccountSummary(account) {
    var context = $('#context').val();
    $.ajax({
        url: context + '/account/' + account.id + '/payments',
        async: false,
        success: function(data) {
            var sum = 0;
            $.each(data, function() {
                sum = sum + this.amount;
            });
            $('.paymentInfo').html('Payments(' + data.length + ')');
            $('.total').html(sum);
        },
        error: function(error, b, c) {
            alert('Fail to get payments : ' + error.responseText);
        }
    });
    $('.csd').html(account.claimNumber);
    $('.status').html(account.status.name + '(' + account.status.id + ')');
    $('.name').html(account.holder.firstName + ' ' + account.holder.lastName);
    $('.birthDate').html(parseDateToString(account.holder.birthDate));
    $('.ssn').html(account.holder.ssn);
    $('.formType').html(account.formType.name);
    $('.title').html(account.holder.title);
    $('.frozen').html(account.frozen === true ? 'YES' : 'NO');
    $('.grace').html(account.grace === true ? 'YES' : 'NO');
    $('.balance').html(account.balance);
    $('.lastAction').html(account.lastAction);
    if (account.lastActionDate != null) {
        $('.lastActionDate').html(parseDateToString(account.lastActionDate));
    }


}

function getAccount(context, accountId) {
    var result = null;
    $.ajax({
        url: context + '/account/' + accountId,
        async: false,
        cache: false,
        success: function(data, text, xhr) {
            result = data;
        },
        error: function(a, b, c) {
            alert('Fail to get account, message:' + a.responseText);

        }
    });
    return result;
}




function makeHomeTab(context, tab, id) {
    var data = {
    };
    if (tab) {
        data.tab = tab;
    }
    if (id) {
        data.defaultTabAccountId = id;
    }
    $.ajax({
        url: context + '/common/tab' + '',
        type: 'POST',
        data: data,
        success: function(data, text, xhr) {
        },
        error: function(a, b, c) {
            alert('Fail to make this tab your home tab, message:' + a.responseText);

        }
    });
}

function validateCalculationEntry(button) {
    var tab = $(button).parents(".tabsBlock").eq(0);
    var status = $(".validationStatusBar .statusVal", tab);
    var entriesTblRows = $(".entriesTbl tbody tr:not(.entriesEditRow)", tab);
    entriesTblRows.removeClass("valErrorRow").removeClass("valErrorRowBefore").removeClass("valErrorRowAfter");
    var validated = true;
    // Bug Fix 2
    var numRows = 0;

    if($(".entriesTbl tbody tr.entriesEditRow", tab).length > 0){
            $(".valErrorRow").prev("tr").addClass("valErrorRowBefore");
            $(".valErrorRow").next("tr").addClass("valErrorRowAfter");
            status.html("Failure").removeClass("successLabel").addClass("failLabel");

            alert('Please finish editing before calculation.');
            return false;
     }

    $.each(entriesTblRows, function(i, row) {
        $(row).removeClass('valErrorRow');
        if ($(this).hasClass('entriesEditRow')) {
            editing = true;
        }
        if (!$(this).hasClass('newEntryRow')) {
            // Bug Fix 2
            numRows++;
            var selectBoxes = [3, 4, 5, 6, 8];
            $.each(selectBoxes, function() {
                var cell = $(row).children('td').eq(this);
                $(cell).removeClass('valErrorRowCell');
                if ($.trim($(cell).html()) === '' || $(cell).html() === 'Select') {
                    validated = false;
                    $(cell).addClass('valErrorRowCell');
                    $(row).addClass('valErrorRow');
                }
            });
            var bDate = $.trim($(row).children('td').eq(1).html());
            var eDate = $.trim($(row).children('td').eq(2).removeClass('valErrorRowCell').html());
            var amount = $.trim($(row).children('td').eq(7).removeClass('valErrorRowCell').html()).replace(/[^0-9\.]+/g, "");
            var iDate = $.trim($(row).children('td').eq(11).html());
            var dmValidate = true;
            if (bDate == '' || isDate(bDate) == false) {
                $(row).children('td').eq(1).addClass('valErrorRowCell');
                $(row).addClass('valErrorRow');
                dmValidate = false;
                validated = false;
            }
            if (iDate != null && iDate != '' && !isDate(iDate)) {
                $(row).children('td').eq(11).addClass('valErrorRowCell');
                $(row).addClass('valErrorRow');
                dmValidate = false;
                validated = false;
            }
            if (eDate == '' || isDate(eDate) == false) {
                $(row).children('td').eq(2).addClass('valErrorRowCell');
                $(row).addClass('valErrorRow');
                dmValidate = false;
                validated = false;
            }
            // Bug Fix 2
            if (amount == '') {
                $(row).children('td').eq(7).addClass('valErrorRowCell');
                $(row).addClass('valErrorRow');
                dmValidate = false;
                validated = false;
            }
            if (dmValidate == true) {
                var beginDate = Date.parse(bDate);
                var endDate = Date.parse(eDate);
                if (endDate < beginDate) {
                    validated = false;
                    $(row).children('td').eq(2).addClass('valErrorRowCell');
                    $(row).addClass('valErrorRow');
                }
            }

        }
    });

    

    // Bug Fix 2

    if(numRows == 0){
        $(".valErrorRow").prev("tr").addClass("valErrorRowBefore");
        $(".valErrorRow").next("tr").addClass("valErrorRowAfter");
        status.html("Failure").removeClass("successLabel").addClass("failLabel");

        alert('No calculation entry in the table.');
        return false;

    }
    if (validated == false) {
        $(".valErrorRow").prev("tr").addClass("valErrorRowBefore");
        $(".valErrorRow").next("tr").addClass("valErrorRowAfter");
        status.html("Failure").removeClass("successLabel").addClass("failLabel");

    } else {
        $(".valErrorRowBefore", tab).removeClass("valErrorRowBefore");
        $(".valErrorRowAfter", tab).removeClass("valErrorRowAfter");
        status.html("Success").addClass("successLabel").removeClass("failLabel");
    }
    return validated;
}

function populateCalculationResult(result, tab) {
    var entity = {
        dePost82: {
            deposit: 0,
            interest: 0,
            total: 0
        },
        dePre82: {
            deposit: 0,
            interest: 0,
            total: 0
        },
        rePost82: {
            deposit: 0,
            interest: 0,
            total: 0
        },
        rePre82: {
            deposit: 0,
            interest: 0,
            total: 0
        }
    };
    $.each(result.dedeposits, function() {
        if (this.depositType == 'PRE_10_82') {
            entity.dePre82.deposit += this.deposit;
            entity.dePre82.interest += this.interest;
            entity.dePre82.total += this.total;
        } else {
            entity.dePost82.deposit += this.deposit;
            entity.dePost82.interest += this.interest;
            entity.dePost82.total += this.total;
        }
    });
    $.each(result.redeposits, function() {
        if (this.depositType == 'PRE_10_82') {
            entity.rePre82.deposit += this.deposit;
            entity.rePre82.interest += this.interest;
            entity.rePre82.total += this.total;
        } else {
            entity.rePost82.deposit += this.deposit;
            entity.rePost82.interest += this.interest;
            entity.rePost82.total += this.total;
        }
    });

    var reTable = $('.chartCalAreaBox4 table tbody', tab);
    reTable.find('tr').eq(0).children('td').eq(1).html(entity.rePost82.deposit);
    reTable.find('tr').eq(0).children('td').eq(2).html(entity.rePost82.interest);
    reTable.find('tr').eq(0).children('td').eq(3).html(entity.rePost82.total);
    reTable.find('tr').eq(1).children('td').eq(1).html(entity.rePre82.deposit);
    reTable.find('tr').eq(1).children('td').eq(2).html(entity.rePre82.interest);
    reTable.find('tr').eq(1).children('td').eq(3).html(entity.rePre82.total);

    var deTable = $('.chartCalAreaBox5 table tbody', tab);
    deTable.find('tr').eq(0).children('td').eq(1).html(entity.dePost82.deposit);
    deTable.find('tr').eq(0).children('td').eq(2).html(entity.dePost82.interest);
    deTable.find('tr').eq(0).children('td').eq(3).html(entity.dePost82.total);
    deTable.find('tr').eq(1).children('td').eq(1).html(entity.dePre82.deposit);
    deTable.find('tr').eq(1).children('td').eq(2).html(entity.dePre82.interest);
    deTable.find('tr').eq(1).children('td').eq(3).html(entity.dePre82.total);

    $('.chartCalAreaBox6 .dollar', tab).eq(0).html(result.summary.totalPaymentsRequired);
    $('.chartCalAreaBox6 .dollar', tab).eq(1).html(result.summary.totalInitialInterest);
    $('.chartCalAreaBox6 .dollar', tab).eq(2).html(result.summary.totalPaymentsApplied);
    $('.chartCalAreaBox6 .dollar', tab).eq(3).html(result.summary.totalBalance);

}

var calculationRunning = false;

function runCalculation(context, tab, save, callback) {
    if (calculationRunning) {
        // ignore
        if(callback){
            callback(2, save, tab);
        }
        return;
    }
    var rows = $('.entriesTbl tbody tr', tab);
    var id = $('.versionBar select', tab).val();
    var entity = [];
    var editing = false;
    $.each(rows, function() {
        if (editing == false) {
            if ($(this).hasClass('entriesEditRow')) {
                alert('Please finish editing before calculation.');
                editing = true;
                if(callback){
                    callback(0, save, tab);
                }
                return false;
            } else if (!$(this).hasClass('newEntryRow')) {
                var calculation = {
                    retirementType: {},
                    periodType: {},
                    appointmentType: {},
                    serviceType: {},
                    payType: {}
                };
                if ($(this).prop('id').indexOf('cal-') != -1  && id.indexOf('new') == -1) {
                    //calculation.id = $(this).prop('id').replace('cal-', '');
                }
                var tds = $(this).children('td');
                calculation.beginDate = Date.parse($(tds).eq(1).html());
                calculation.endDate = Date.parse($(tds).eq(2).html());
                calculation.retirementType = {id: $(tds).eq(3).next('input:hidden').val(), name: $(tds).eq(3).html()};
                calculation.periodType = {id: $(tds).eq(4).next('input:hidden').val(), name: $(tds).eq(4).html()};
                calculation.appointmentType = {id: $(tds).eq(5).next('input:hidden').val(), name: $(tds).eq(5).html()};
                calculation.serviceType = {id: $(tds).eq(6).next('input:hidden').val(), name: $(tds).eq(6).html()};
                calculation.amount = $(tds).eq(7).html().replace(/[^0-9\.]+/g, "");
                calculation.payType = {id: $(tds).eq(8).next('input:hidden').val(), name: $(tds).eq(8).html()};
                calculation.connerCase = $(tds).eq(10).html() == "YES";
                if ($(tds).eq(11).html() != '' && $(tds).eq(11).html() != null) {
                    calculation.interestAccrualDate = Date.parse($(tds).eq(11).html());
                } else {
                    calculation.interestAccrualDate = null;
                }
                var rate = $(tds).eq(9).html();
                if (rate != '' && rate != null) {
                    calculation.interestRate = rate;
                } else {
                    calculation.interestRate = null;
                }
                entity.push(calculation);
            }
        }

    });
    if (editing == true) {
        if(callback){
            callback(0, save, tab);
        }
        return false;
    }
    if (entity.length == 0) {
        alert('No calculation entry in the table.');
        if(callback){
            callback(0, save, tab);
        }
        return false;
    }

    // BRE Integration Update
    var calcRequest = {};
    calcRequest.calculations = entity;
    
    if($('.interestCalculatedToDate', tab).val().length  == 0){
        $('.interestCalculatedToDate', tab).val(parseDateToString(new Date()));
    }
    
    if( !isDate($('.interestCalculatedToDate', tab).val())) {
        alert("Please specify a valid date value for 'Calculate as of' field");
        if(callback){
            callback(0, save, tab);
        }
        return false;
    }
    
    calcRequest.interestCalculatedToDate = Date.parse($('.interestCalculatedToDate', tab).val());
    
    
    calculationRunning = true;

    $.ajax({
        url: context + '/account/' + 1 + '/calculation/run',
        type: 'POST',
        async: true,
        contentType: 'application/json',
        data: JSON.stringify(calcRequest),
        success: function(data, text, xhr) {
            $('.resultsVal', tab).html(data.calculationStatus.name);
            populateCalculationItem(data, tab);
            decorateCalculationResult(tab);
            populateCalculationResult(data, tab);
            
            results['r-' + id] = {};
            results['r-' + id].result = data;
            //$('.calculateDate', tab).html(parseDateToString(new Date()));
            $('.dollar').formatCurrency({
                negativeFormat: '%s-%n'
            });
            if (save) {
                var version = {
                    calculations: entity,
                    //calculationDate: Date.parse($('.calculateDate', tab).html()),
                    calculationDate: Date.parse($('.interestCalculatedToDate', tab).val()),
                    calculationResult: data,
                    name: ''
                };

                version.calculationResult.calculationStatus.id = 3;
                var versionId = $('.versionBar select', tab).val();
                if (versionId.indexOf('new') == -1 && versionId.indexOf('save') == -1) {
                    version.id = versionId;
                    version.name = $('.versionBar select option:selected', tab).text();
                } else if(versionId.indexOf('save') >= 0){

                    version.name = $('.versionBar select option:selected', tab).text();

                } else {

                    /*var maxId = 0;
                    $(".versionBar select option", tab).each(function(){
                        if(isNumber(parseInt($(this).val(), 10)) && parseInt($(this).val(), 10) > maxId){
                            maxId = parseInt($(this).val(), 10);
                        }
                    });

                    if(maxId > 0){
                        version.name = "newScenario"+ maxId;
                    }*/

                    //version.id = 0;

                    version.name = "scenario "+$('.versionBar select option:selected', tab).text().replace("New Version ","");
                    

                    //version.name = "newScenario"+Math.max.apply(null, $(".versionBar select option[value^='new']", tab).map(function(){ return parseInt($(this).val(),10);}).get());
                }
                var accountId = $('#accountId').val();
                version.accountId = accountId;
                $.ajax({
                    url: context + '/account/' + accountId + '/calculation/save',
                    type: 'PUT',
                    async: false,
                    contentType: 'application/json',
                    data: JSON.stringify(version),
                    success: function(data, text, xhr) {

                        if(data.id == 0){
                            data.id = versionId.replace("new", "save");
                        }
                        calculationRunning = false;
                        if(callback){
                            callback(1, save, tab, data);
                        }
                        return true;
                    },
                    error: function(a, b, c) {
                        calculationRunning = false;
                        alert('Fail to save calculation version, message:' + a.responseText);
                        if(callback){
                            callback(0, save, tab);
                        }
                        return false;
                    }
                });
            } else {
                calculationRunning = false;
            }

            if(callback){
                callback(1, save, tab);
            }

            return true;
        },
        error: function(a, b, c) {
            calculationRunning = false;
            alert('Fail to run calculation, message:' + a.responseText);
            if(callback){
                callback(0, save, tab);
            }
            return false;

        }
    });

}


function validateDateString(dateString) {
    var parts = dateString.split("/");
    if (parts.length != 3) {
        return false;
    }
    var theDate = new Date(dateString);
    if (isNaN(theDate.getDate())) {
        return false;
    }
    var date = theDate.getDate();
    var mon = theDate.getMonth() + 1;
    var year = theDate.getFullYear();
    if (date != parseInt(parts[1]) || mon != parseInt(parts[0]) || year != parseInt(parts[2])) {
        return false;
    }
    return true;
}

function populateCalculationItem(data, tab) {
    $(".jsCancelFunction", tab).show();
    $(".jsTriggerBill", tab).hide();
    $(".jsShowCalculation", tab).show();
    $(".jsShowSample", tab).removeClass("priBtnDisabled");
    $(".jsExpandCalculation", tab).removeClass("priBtnDisabled");
    $(".noValidMask", tab).hide();
    var validTbl = $(".validateResultTbl", tab);
    $("tbody", validTbl).find('tr').remove();
    $.each(data.items, function() {
        var template = $('#resultItemTemplate').find('tr').clone();
        template.find('td').eq(1).html(parseDateToString(this.startDate));
        template.find('td').eq(2).html(parseDateToString(this.endDate));
        template.find('td').eq(3).html(parseDateToString(this.midDate));
        template.find('td').eq(4).html(parseDateToString(this.effectiveDate));
        template.find('td').eq(5).html(this.periodType.name);
        template.find('td').eq(6).html(this.deductionAmount);
        template.find('td').eq(7).html(this.totalInterest);
        template.find('td').eq(8).html(this.paymentsApplied);
        template.find('td').eq(9).html(this.balance);
        $("tbody", validTbl).append(template);
    });
}

function decorateCalculationResult(tab) {
    var result = $('.resultsVal', tab);
    var validation = $('.statusVal', tab);
    if (result.html() == 'Success' || result.html() == 'Calculation Saved' || result.html() == 'Calculation Triggered Pending' || result.html() == 'Calculation') {
        result.addClass('successLabel');
        result.removeClass('failLabel');
    } else if (result.html() == 'Unknown') {
        result.removeClass('successLabel');
        result.removeClass('failLabel');
    } else {
        result.removeClass('successLabel');
        result.addClass('failLabel');
    }


    if (validation.html() == 'Success') {
        validation.addClass('successLabel');
        validation.removeClass('failLabel');
    } else if (validation.html() == 'Unknown') {
        validation.removeClass('successLabel');
        validation.removeClass('failLabel');
    } else {
        validation.removeClass('successLabel');
        validation.addClass('failLabel');
    }


}

// Bug Fix 2
function shortenSelect(identifier, lengthToShortenTo){

    // Shorten select option text if it stretches beyond max-width of select element
    $.each($(identifier+' option'), function(key, optionElement) {
        var curText = $(optionElement).text();
        $(this).attr('title', curText);
    
        if (curText.length > lengthToShortenTo) {
            $(this).text(curText.substring(0, lengthToShortenTo-3) + '... ' );
        }
    });
}

function recreateActionRow(statusSpan, tab) {
    if (statusSpan.html() == 'Success') {
        $(".jsCancelFunction", tab).show();
        $(".jsTriggerBill", tab).hide();
    } else if (statusSpan.html() == 'Calculation Saved') {
        $(".jsCancelFunction", tab).hide();
        $(".jsTriggerBill", tab).show();
    } else if (statusSpan.html() == 'Calculation Triggered Pending') {
        $(".jsCancelFunction", tab).hide();
        $(".jsTriggerBill", tab).hide();
    }
}
function addNewVersion(button, copy) {
    // tab id
    //var tabId = $('#depositTab, #redepositTab').filter('.current').prop('id');
    // tab
    var tab = $(button).parents(".tabsBlock").eq(0);

    var tabId = 'depositTab';
    // calculate date
    //var dateSpan = $('.calculateDate', tab); Removed in BRE Integration to Web App Assembly
    var dateSpan = $('.interestCalculatedToDate', tab);
    // status
    var statusSpan = $('.resultsVal', tab);
    // validation
    var validationSpan = $('.statusVal', tab);
    // table
    var table = $('.entriesTbl', tab);
    // select
    var select = $('.versionBar select', tab);
    // delete button
    $('.jsDelVersionBtn', tab).removeClass('priBtnDisabled');
    // temparea
    var tempArea = $('.depositVersionTbodyArea');
    //$(".jsCancelFunction", tab).trigger("click");
    //$(".jsTriggerBill", tab).hide("");

    // switch information between temp space
    var currentTbody = table.find('tbody').eq(0).addClass('isHidden');

    var verSelector = $(".versionBar select", tab);
    //var newIndex = 'new-' + tabId + '-' + (verSelector.find("option[value^='new']").length + 1);
    var newIndex = 'new-' + tabId + '-' + versionNum;


    var tbody = $('#versionTableTemplate tbody').clone();
    var newRow = $('#versionNewTemplate tbody tr').clone();
    tbody.children('tr').eq(0).remove();
    tbody.append(newRow);
    if (copy == true) {
        tbody = currentTbody.clone().removeClass('isHidden');
    }
    tbody.prop('id', 'tbody-' + newIndex);

    tempArea.append(tbody);
    tempArea.append(statusSpan.clone().html('Unknown').removeClass('failLabel').removeClass('successLabel').prop('id', 'statusSpan-' + newIndex));
    tempArea.append(validationSpan.clone().html('Unknown').removeClass('failLabel').removeClass('successLabel').prop('id', 'validationSpan-' + newIndex));
    tempArea.append(dateSpan.clone().val('').prop('id', 'dateSpan-' + newIndex));




    verSelector.append($('<option>', {
        value: newIndex,
        text: 'New Version '+ formatFullDate(new Date())
    }));
    versionNum++;

    //var idx = $("option", verSelector).length - 1;
    //$(".versionBar select", tab)[0].selectedIndex = idx;
    $(select).val(newIndex);
    $('option', select).sort(selectSortByText).appendTo($(select));
    select.change();

}

function deleteVersion(context, accountId, type, versionId) {
    $.ajax({
        url: context + '/account/calculation/delete?calculationVersionId=' + versionId + '&resourceName=link',
        type: 'DELETE',
        async: false,
        success: function(data, text, xhr) {
        },
        error: function(a, b, c) {
            //alert('fail to delete calculation version, message:' + a.responseText);
        }
    });
}

function updateCalculationVersionDeleteButton(tabName) {
    var table = $('.entriesTbl', tabName);
    var count = 0;
    table.find("tbody tr").each(function() {
        var row = $(this);
        if (!row.hasClass("newEntryRow")) {
            count++;
        }
    });
    if (count > 0) {
        $('.jsDelVersionBtn', tabName).removeClass('priBtnDisabled');
    } else {
        $('.jsDelVersionBtn', tabName).addClass('priBtnDisabled');
    }
}

function predicatBy(prop){
   return function(a,b){
      if( a[prop] > b[prop]){
          return 1;
      }else if( a[prop] < b[prop] ){
          return -1;
      }
      return 0;
   }
}

function selectSortByText(objA, objB){

    return $(objA).text().localeCompare($(objB).text());

}

function runCalculationCallBack(res, save, tab, calculationVersion){

    var result = $(".validationStatusBar .resultsVal", tab);

    if(save){

        if(res === 1){

            $(".jsCancelFunction", tab).hide();
            $(".jsTriggerBill", tab).show();

            if(calculationVersion){

                var prevId = $('.versionBar select option:selected').val();

                if(calculationVersion.id > 0 || (calculationVersion.id+"").indexOf("save") >= 0 ){

                    $('.versionBar select option:selected').val(calculationVersion.id);
                    $(tab).data('currentVersionId', calculationVersion.id);
                    $('tbody#tbody-' + prevId, tab).prop('id', calculationVersion.id);
                    $('#dateSpan-' + prevId, tab).prop('id', calculationVersion.id);
                    $('#statusSpan-' + prevId, tab).prop('id', calculationVersion.id);
                    $('#validationSpan-' + prevId, tab).prop('id', calculationVersion.id);
                    var tempArea = $('.depositVersionTbodyArea');

                    $('tbody#tbody-' + prevId, tempArea).prop('id', calculationVersion.id);
                    $('#dateSpan-' + prevId, tempArea).prop('id', calculationVersion.id);
                    $('#statusSpan-' + prevId, tempArea).prop('id', calculationVersion.id);
                    $('#validationSpan-' + prevId, tempArea).prop('id', calculationVersion.id);

                }

                $('.versionBar select option:selected').text(calculationVersion.name);


            }
            
            /*var prevId = $('.versionBar select option:selected').val();
            $('.versionBar select option:selected').val(calculationVersion.id);
            $(tab).data('currentVersionId', calculationVersion.id);
            $('tbody#tbody-' + prevId, tab).prop('id', calculationVersion.id);
            var tabName = $(tab).hasClass('depositTab') ? 'depositTab' : 'redepositTab';
            var tempArea = tabName == 'depositTab' ? $('.depositVersionTbodyArea') : $('.redepositVersionTbodyArea');
            $('tbody#tbody-' + prevId, tempArea).prop('id', calculationVersion.id);*/


        } else if (res === 0){
            result.html("Failed").addClass("failLabel").removeClass('successLabel');
        }

    } else {

        if(res === 0){
            result.html("Failed").addClass("failLabel").removeClass('successLabel');
        }
    }


}

function populateCalculationVersion(account, tabName2) {

    // calculation version
    var dvs = account.calculationVersions;

    var tabName = 'depositTab';
    // the deposit tab
    var tab = $('.' + tabName);
    // is this page the finish page?
    var finish = false;
    // the version drop down
    var select = $('.versionBar select', tab);
    // the table
    var table = $('.entriesTbl', tab);
    if (table.length == 0) {
        table = $('.resultTbl', tab);
        finish = true;
    }
    // calculate date
    // var dateSpan = $('.calculateDate', tab); Removed in "OPM - Rules Engine - Integrate with Web App Assembly v1.0 "
    var dateSpan = $('.interestCalculatedToDate', tab);
    // status
    var statusSpan = $('.resultsVal', tab);
    // validation
    var validationSpan = $('.statusVal', tab);
    // temp area
    var tempArea = $('.depositVersionTbodyArea');


    select.html('');
    //if (dvs.length == 0 && finish == false) {
        //addNewVersion(select);
        //return;
    //}

    $.each(dvs, function(i) {
        var option = "<option value='" + this.id + "'";
        if (i == 0) {
            option += " selected='selected'";
        }
        //    option += ">" + (i + 1) + "-" + this.name + "</option>";
        option += ">"+ this.name + "</option>";
        select.append(option);

        var tbody = $('#versionTableTemplate tbody').clone();

        $.each(this.calculations, function() {
            var rowTemplate = tbody.children('tr').eq(0).clone();
            rowTemplate.prop('id', 'cal-' + this.id);
            rowTemplate.children('td').eq(1).html(parseDateToString(new Date(this.beginDate)));
            rowTemplate.children('td').eq(2).html(parseDateToString(new Date(this.endDate)));
            rowTemplate.children('td').eq(3).html(this.retirementType.name);
            rowTemplate.children('input:hidden').eq(0).val(this.retirementType.id);
            rowTemplate.children('td').eq(4).html(this.periodType.name);
            rowTemplate.children('input:hidden').eq(1).val(this.periodType.id);
            rowTemplate.children('td').eq(5).html(this.appointmentType.name);
            rowTemplate.children('input:hidden').eq(2).val(this.appointmentType.id);
            rowTemplate.children('td').eq(6).html(this.serviceType.name);
            rowTemplate.children('input:hidden').eq(3).val(this.serviceType.id);
            rowTemplate.children('td').eq(7).html(this.amount);
            rowTemplate.children('td').eq(8).html(this.payType.name);
            rowTemplate.children('input:hidden').eq(4).val(this.payType.id);
            if (this.interestRate !== null) {
                rowTemplate.children('td').eq(9).html(this.interestRate);
            } else {
                rowTemplate.children('td').eq(9).html('');
            }
            rowTemplate.children('td').eq(10).html(this.connerCase ? 'YES' : 'NO');
            if (this.interestAccrualDate) {
                rowTemplate.children('td').eq(11).html(parseDateToString(new Date(this.interestAccrualDate)));
            } else {
                rowTemplate.children('td').eq(11).html('');
            }
            tbody.children('tr').last().after(rowTemplate);
        });
        // send information to the temp space
        tbody.children('tr').eq(0).remove();
        if (finish == false) {
            var newRow = $('#versionNewTemplate tbody tr').clone();
            tbody.append(newRow);
        }

        tbody.prop('id', 'tbody-' + this.id);
        tempArea.append(tbody);
        dateSpan.val(parseDateToString(this.calculationDate));
        var copyDateSpan = dateSpan.clone().prop('id', 'dateSpan-' + this.id);
        tempArea.append(copyDateSpan);
        statusSpan.html(this.calculationResult.calculationStatus.name);
        
        if (statusSpan.html() == 'Success' || statusSpan.html() == 'Calculation Saved' || statusSpan.html() == 'Calculation Triggered Pending' || statusSpan.html() == 'Calculation') {
            validationSpan.html('Success').addClass('successLabel').removeClass('failLabel');
            statusSpan.addClass('successLabel').removeClass('failLabel');
        } else if(statusSpan.html() == 'Failure' || statusSpan.html() == 'Failed') {
            validationSpan.html('Failure').removeClass('successLabel').addClass('failLabel');
            statusSpan.removeClass('successLabel').addClass('failLabel');
        } else {
            validationSpan.html('Unknown').removeClass('successLabel').removeClass('failLabel');
            statusSpan.removeClass('successLabel').removeClass('failLabel');
        }

        var copyStatusSpan = statusSpan.clone().prop('id', 'statusSpan-' + this.id);
        tempArea.append(copyStatusSpan);
        var copyValidationSpan = validationSpan.clone().prop('id', 'validationSpan-' + this.id);
        tempArea.append(copyValidationSpan);


        // send result to global variable
        results['r-' + this.id] = {};
        results['r-' + this.id].result = this.calculationResult;

    });

    $('option', select).sort(selectSortByText).appendTo($(select));



    /*select.change(function() {

        if($(this).val() == ""){
            return;
        }

        // temp area
        var tempArea = $('.depositVersionTbodyArea');

        // calculation tab
        var tab = $('.depositTab');

        // the table
        var table = $('.entriesTbl', tab);


        // switch information between temp space
        var currentTbody = table.find('tbody').eq(0).addClass('isHidden');
        //var selectId = this.options[this.selectedIndex].value;
        var selectId = $(this).val();

        if(currentTbody.length != 0){           
            currentTbody.find('tr.entriesEditRow').children('td').eq(0).trigger('click');
            var id = currentTbody.prop('id');
            if(id){

                id = id.replace('tbody-', '');
                tempArea.find('tbody#tbody-' + id).remove();
                //  tempArea.find('#dateSpan-' + id).remove(); Removed in "OPM - Rules Engine - Integrate with Web App Assembly v1.0 "
                tempArea.find('#dateSpan-' + id).remove();
                tempArea.find('#statusSpan-' + id).remove();
                tempArea.find('#validationSpan-' + id).remove();
                tempArea.append(currentTbody);
                //  var copyDateSpan = dateSpan.clone().prop('id', 'dateSpan-' + id); Removed in "OPM - Rules Engine - Integrate with Web App Assembly v1.0 "
                //  tempArea.append(copyDateSpan); Removed in "OPM - Rules Engine - Integrate with Web App Assembly v1.0 "
                //var copyStatusSpan = statusSpan.clone().prop('id', 'statusSpan-' + id);
                var copyDateSpan = $('.interestCalculatedToDate', tab).clone().prop('id', 'dateSpan-' + id); 
                tempArea.append(copyDateSpan);

                var copyStatusSpan = $('.resultsVal', tab).clone().prop('id', 'statusSpan-' + id);
                tempArea.append(copyStatusSpan);
                //var copyValidationSpan = validationSpan.clone().prop('id', 'validationSpan-' + id);
                var copyValidationSpan = $('.statusVal', tab).clone().prop('id', 'validationSpan-' + id);
                tempArea.append(copyValidationSpan);

            }
            

        }

        $(tab).data('currentVersionId', selectId);
        


        var newId = $(this).val();
        var newTbody = $('#tbody-' + newId, tempArea).clone().removeClass('isHidden');
        table.find('tbody').remove();
        table.append(newTbody);
        //dateSpan.html($('#dateSpan-' + newId).html()); Removed in "OPM - Rules Engine - Integrate with Web App Assembly v1.0 "
        $('.interestCalculatedToDate', tab).val($('#dateSpan-' + newId, tempArea).val());
        //statusSpan.html($('#statusSpan-' + newId, tempArea).html());
        $('.resultsVal', tab).replaceWith($('#statusSpan-' + newId, tempArea)).addClass('resultsVal');
        //validationSpan.html($('#validationSpan-' + newId, tempArea).html());
        $('.statusVal', tab).replaceWith($('#validationSpan-' + newId, tempArea)).addClass('statusVal');
        decorateCalculationResult(tab);

        if (results['r-' + selectId] && results['r-' + selectId].result && results['r-' + selectId].result.items &&  results['r-' + selectId].result.items.length > 0) {
            populateCalculationItem(results['r-' + selectId].result, tab);
            populateCalculationResult(results['r-' + selectId].result, tab);
            $('.dollar').formatCurrency({
                negativeFormat: '%s-%n'
            });
        } else {
            $('.jsCancelFunction', tab).trigger('click');
        }

        // recreate the action row
        //recreateActionRow(statusSpan, tab);
        recreateActionRow($('.resultsVal', tab), tab);
    });*/

    if($(tab).data('currentVersionId') !== ""){

        var cur = select.find("option[value='"+$(tab).data('currentVersionId')+"']");
        if(cur.length != 0){
            select.val($(tab).data('currentVersionId'));

        }

    }

    if(select.val() !== ''){
        select.change();
    }

    

    if (dvs.length == 0 && finish == false) {
        addNewVersion(select);
    }
}
