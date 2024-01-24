    sap.ui.define([
        "sap/ui/core/library",
        "sap/ui/core/Fragment",
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/format/DateFormat",
        "sap/ui/model/json/JSONModel",
        "sap/ui/unified/library",
        "sap/m/library",
        "sap/m/MessageToast",
        "sap/ui/core/date/UI5Date",
        "sap/m/Dialog",
        "sap/m/Button"
    ],
    function(coreLibrary, Fragment, Controller, DateFormat, JSONModel, unifiedLibrary, mobileLibrary, MessageToast, UI5Date,Dialog,Button) {
        "use strict";
        var that;
    
        var CalendarDayType = unifiedLibrary.CalendarDayType;
        var ValueState = coreLibrary.ValueState;
        var StickyMode = mobileLibrary.PlanningCalendarStickyMode;
    
        return Controller.extend("com.leavetracker.leavetracker.controller.Main", {
    
            onInit: function() {
                
            
                that=this;
                var oModel = new JSONModel();
                oModel.setData({
                        startDate: UI5Date.getInstance("2024", "0", "23"),
                        appointments: [{
                            title: "Meet John Miller",
                            type: CalendarDayType.Type05,
                            startDate: UI5Date.getInstance("2024", "0", "8", "5", "0"),
                            endDate: UI5Date.getInstance("2024", "0", "8", "6", "0")
                        }
                    ],
                    supportedAppointmentItems: [
                        {
                            text: "Sick Leave",
                            type: CalendarDayType.Type01
                        },
                        {
                            text: "Casual Leave",
                            type: CalendarDayType.Type02
                        },
                        {
                            text: "Vacation",
                            type: CalendarDayType.Type03
                        },
                        {
                            text: "Out of office",
                            type: CalendarDayType.Type04
                        },
                        {
                            text: "Work From Home",
                            type: CalendarDayType.Type05
                        },
                        {
                            text: "Half Day Leave",
                            type: CalendarDayType.Type06
                        }
                    ]
                });
    
                this.getView().setModel(oModel);
    
                oModel = new JSONModel();
                oModel.setData({allDay: false});
                this.getView().setModel(oModel, "allDay");
    
                oModel = new JSONModel();
                oModel.setData({ stickyMode: StickyMode.None, enableAppointmentsDragAndDrop: true, enableAppointmentsResize: true, enableAppointmentsCreate: true });
                this.getView().setModel(oModel, "settings");
               
            },
    onAfterRendering: function () {
        var oView = this.getView();
        oView.setBusy(true);
        Fragment.load({
            name: "com.leavetracker.leavetracker.Fragments.Signup",
            controller: this
        }).then(function (oFragment) {
            this._oDialog = new Dialog({
                title: "Signup",
                id:"DialogId",
                icon: "sap-icon://account",
                content: oFragment,
                afterClose: function () {
                    this._oDialog.destroy();
                }.bind(this)
            });
        
            this._oDialog.open();
        }.bind(this));
    },
    onclose: function () {
        if (this._oDialog) {
            this._oDialog.close();
        
        }

    },
    onSignUpPress:function(oEvent){
        if(sap.ui.getCore().byId("DialogId").getTitle()==="Signup")
        {
            this.SignUpPress(true);          
        }
        else{
           
            
            this.onSignIn(true);
       }
    },
    SignUpPress: function(oEvent) {
    // Validation logic
        var obj = {};               
        obj.FirstName = sap.ui.getCore().byId("firstNameInput").getValue();
        obj.LastName = sap.ui.getCore().byId("lastNameInput").getValue();
        obj.Email = sap.ui.getCore().byId("emailInput").getValue();
        obj.Password = sap.ui.getCore().byId("passwordInput").getValue();
        var reenterPassword = sap.ui.getCore().byId("reenterpasswordInput").getValue();

        // Flag to check if all validations pass
        var isValid = true;

        // Validation for first name (minimum 5 characters)
        if (obj.FirstName.length < 5) {
        sap.m.MessageToast.show("First Name should have at least 5 characters");
        isValid = false;
        }

        // Validation for last name (minimum 5 characters)
        if (obj.LastName.length < 5) {
        sap.m.MessageToast.show("Last Name should have at least 5 characters");
        isValid = false;
        }

        // Validation for email format
        if (!obj.Email.match(/^.+@gmail\.com$/)) {
        sap.m.MessageToast.show("Invalid Email format. It should be in the format: example@gmail.com");
        isValid = false;
        }

        // Validation for password (minimum 6 characters, at least 1 capital letter, and 1 special character)
        if (!obj.Password.match(/^(?=.*[A-Z])(?=.*[!@#$%^&*])(.{6,})$/)) {
        sap.m.MessageToast.show("Password should have at least 6 characters, 1 capital letter, and 1 special character");
        isValid = false;
        }

        // Validation for re-enter password
        if (obj.Password !== reenterPassword) {
        sap.m.MessageToast.show("Passwords do not match");
        isValid = false;
        }

        // If all validations pass, proceed with signup
        if (isValid) {
        // Rest of your existing signup logic goes here
        // ...
        var oModel = this.getOwnerComponent().getModel();
        oModel.create("/et_signupSet",obj,{
        success: function (odata){
            if(odata.MessageType==="S"){
                sap.m.MessageToast.show(odata.Message);
                sap.ui.getCore().byId("DialogId").setTitle("Login");
                sap.ui.getCore().byId("linkid").setText("Don't have an account? Sign Up")
                sap.ui.getCore().byId("buttonid").setText("LogIn")
                sap.ui.getCore().byId("fnlabel").setVisible(false);
                sap.ui.getCore().byId("firstNameInput").setVisible(false);
                sap.ui.getCore().byId("lnlabel").setVisible(false);
                sap.ui.getCore().byId("lastNameInput").setVisible(false);
                sap.ui.getCore().byId("repassword").setVisible(false);
                sap.ui.getCore().byId("reenterpasswordInput").setVisible(false); 
                this.onClear(true);
                //this._oDialog.close();
                
            } else{
                sap.m.MessageToast.show(odata.Message)
            }
            

            
                            
        }.bind(this), 
        error: function (err) {
        sap.m.MessageToast.show("Failed");
        }
        });

        } else {
        // Handle the case where validations fail
        // For example, you might want to disable the signup button
        // or show a general error message
        sap.ui.getCore().byId("buttonid").setEnabled(false);
        }
        },

    onSwitchToLoginPress:function(){
        if(sap.ui.getCore().byId("DialogId").mProperties.title==="Signup"){
            sap.ui.getCore().byId("DialogId").setTitle("Login");
            sap.ui.getCore().byId("linkid").setText("Don't have an account? Sign Up");
            sap.ui.getCore().byId("buttonid").setText("LogIn")
            sap.ui.getCore().byId("fnlabel").setVisible(false);
            sap.ui.getCore().byId("firstNameInput").setVisible(false);
            sap.ui.getCore().byId("lnlabel").setVisible(false);
            sap.ui.getCore().byId("lastNameInput").setVisible(false);
            sap.ui.getCore().byId("repassword").setVisible(false);
            sap.ui.getCore().byId("reenterpasswordInput").setVisible(false); 
            sap.ui.getCore().byId("emailInput").setValue("");
            sap.ui.getCore().byId("passwordInput").setValue("");
        
        //     var obj = {};               
        //     var oModel = this.getOwnerComponent().getModel();
        //     oModel.create("/et_signupSet",obj,{
        //     success: function (odata){
        //      sap.m.MessageToast.show("Success");
        //      this.onClear(true);
                            
        //     }.bind(this), 
        //     error: function (err) {
        //     sap.m.MessageToast.show("Failed");
        //     }
        // });
        
    }
    else{
        var obj = {};   
        sap.ui.getCore().byId("DialogId").setTitle("Signup");
            sap.ui.getCore().byId("linkid").setText("Do you have already an account?")
            sap.ui.getCore().byId("buttonid").setText("SignIn")
            sap.ui.getCore().byId("fnlabel").setVisible(true);
            sap.ui.getCore().byId("firstNameInput").setVisible(true);
            sap.ui.getCore().byId("lnlabel").setVisible(true);
            sap.ui.getCore().byId("lastNameInput").setVisible(true);
            sap.ui.getCore().byId("repassword").setVisible(true);
            sap.ui.getCore().byId("reenterpasswordInput").setVisible(true);   
            obj.FirstName=sap.ui.getCore().byId("firstNameInput").getValue();
            obj.LastName=sap.ui.getCore().byId("lastNameInput").getValue();
            obj.Email=sap.ui.getCore().byId("emailInput").getValue();
            obj.Password=sap.ui.getCore().byId("passwordInput").getValue();
            var oModel = this.getOwnerComponent().getModel();
            // oModel.create("/et_signupSet",obj,{
            //     success: function (odata){
            //         sap.m.MessageToast.show("Success");
                
                
                                
            //     }.bind(this), 
            //     error: function (err) {
            //     sap.m.MessageToast.show("Failed");
            //     }
            // });
        }
        },
    onSignIn:function(){
        var oView = this.getView();
        var Email=sap.ui.getCore().byId("emailInput").getValue();
        var password=sap.ui.getCore().byId("passwordInput").getValue();
        var aFilter=[];
        aFilter.push(new sap.ui.model.Filter("Email",sap.ui.model.FilterOperator.EQ,Email));
        aFilter.push(new sap.ui.model.Filter("Password",sap.ui.model.FilterOperator.EQ,password));
        var oModel = this.getOwnerComponent().getModel();
        oModel.read("/et_signupSet",{
        filters:aFilter,
            success: function (odata,res){
                if(res.statusCode === "200"){
                    sap.m.MessageToast.show("Welcome");
                    that.onclose(); 
                    oView.setBusy(false); 
                }else{
                    sap.m.MessageToast.show(JSON.parse(res.headers["sap-message"]).message);
                }
            },
            error:function(err){
                sap.m.MessageToast.show("Failed");
            }
    });

    },
            _typeFormatter: function(sType) {
                var sTypeText = "",
                    aTypes = this.getView().getModel().getData().supportedAppointmentItems;
    
                for (var  i = 0; i < aTypes.length; i++){
                    if (aTypes[i].type === sType){
                        sTypeText = aTypes[i].text;
                    }
                }
    
                if (sTypeText !== ""){
                    return sTypeText;
                } else {
                    return sType;
                }
            },
            
            
            
            handleAppointmentDrop: function (oEvent) {
                var oAppointment = oEvent.getParameter("appointment"),
                    oStartDate = oEvent.getParameter("startDate"),
                    oEndDate = oEvent.getParameter("endDate"),
                    bCopy = oEvent.getParameter("copy"),
                    sAppointmentTitle = oAppointment.getTitle(),
                    oModel = this.getView().getModel(),
                    oNewAppointment;
    
                if (bCopy) {
                    oNewAppointment = {
                        title: sAppointmentTitle,
                        icon: oAppointment.getIcon(),
                        text: oAppointment.getText(),
                        type: oAppointment.getType(),
                        startDate: oStartDate,
                        endDate: oEndDate
                    };
                    oModel.getData().appointments.push(oNewAppointment);
                    oModel.updateBindings();
                } else {
                    oAppointment.setStartDate(oStartDate);
                    oAppointment.setEndDate(oEndDate);
                }
    
                MessageToast.show("Appointment with title \n'"
                    + sAppointmentTitle
                    + "'\n has been " + (bCopy ? "create" : "moved")
                );
            },
          
            onLivechange:function(){
                sap.ui.getCore().byId("buttonid").setEnabled(true);
            },
           
            // SignUpPress:function(oEvent){
            //     var obj = {};               
            //     obj.FirstName=sap.ui.getCore().byId("firstNameInput").getValue();
            //     obj.LastName=sap.ui.getCore().byId("lastNameInput").getValue();
            //     obj.Email=sap.ui.getCore().byId("emailInput").getValue();
            //     obj.Password=sap.ui.getCore().byId("passwordInput").getValue();
            //     var oModel = this.getOwnerComponent().getModel();
            //     oModel.create("/et_signupSet",obj,{
            //         success: function (odata){
            //             if(odata.MessageType==="S"){
            //                 sap.m.MessageToast.show(odata.Message);
            //                 sap.ui.getCore().byId("DialogId").setTitle("Login");
            //                 sap.ui.getCore().byId("linkid").setText("Don't have an account? Sign Up")
            //                 sap.ui.getCore().byId("buttonid").setText("LogIn")
            //                 sap.ui.getCore().byId("fnlabel").setVisible(false);
            //                 sap.ui.getCore().byId("firstNameInput").setVisible(false);
            //                 sap.ui.getCore().byId("lnlabel").setVisible(false);
            //                 sap.ui.getCore().byId("lastNameInput").setVisible(false);
            //                 sap.ui.getCore().byId("repassword").setVisible(false);
            //                 sap.ui.getCore().byId("reenterpasswordInput").setVisible(false); 
            //                 this.onClear(true);
                            
            //             } else{
            //                 sap.m.MessageToast.show(odata.Message)
            //             }
                        
                   
                      
                                       
            //         }.bind(this), 
            //         error: function (err) {
            //         sap.m.MessageToast.show("Failed");
            //         }
            //     });


            // },
        
            onClear:function(){
                sap.ui.getCore().byId("firstNameInput").setValue("");
                sap.ui.getCore().byId("lastNameInput").setValue("");
                sap.ui.getCore().byId("emailInput").setValue("");
                sap.ui.getCore().byId("passwordInput").setValue("");
                sap.ui.getCore().byId("reenterpasswordInput").setValue("");
            },
            handleAppointmentResize: function (oEvent) {
                var oAppointment = oEvent.getParameter("appointment"),
                    oStartDate = oEvent.getParameter("startDate"),
                    oEndDate = oEvent.getParameter("endDate"),
                    sAppointmentTitle = oAppointment.getTitle();
    
                oAppointment.setStartDate(oStartDate);
                oAppointment.setEndDate(oEndDate);
    
                MessageToast.show("Appointment with title \n'"
                    + sAppointmentTitle
                    + "'\n has been resized"
                );
            },
    
            handleAppointmentCreateDnD: function(oEvent) {
                var oStartDate = oEvent.getParameter("startDate"),
                    oEndDate = oEvent.getParameter("endDate"),
                    sAppointmentTitle = "New Appointment",
                    oModel = this.getView().getModel(),
                    oNewAppointment = {
                        title: sAppointmentTitle,
                        startDate: oStartDate,
                        endDate: oEndDate
                    };
    
                oModel.getData().appointments.push(oNewAppointment);
                oModel.updateBindings();
    
                MessageToast.show("Appointment with title \n'"
                    + sAppointmentTitle
                    + "'\n has been created"
                );
            },
    
            handleViewChange: function () {
                MessageToast.show("'viewChange' event fired.");
            },
    
            handleAppointmentSelect: function (oEvent) {
                var oAppointment = oEvent.getParameter("appointment"),
                    oStartDate,
                    oEndDate,
                    oTrimmedStartDate,
                    oTrimmedEndDate,
                    bAllDate,
                    oModel,
                    oView = this.getView();
    
                if (oAppointment === undefined) {
                    return;
                }
    
                oStartDate = oAppointment.getStartDate();
                oEndDate = oAppointment.getEndDate();
                oTrimmedStartDate = UI5Date.getInstance(oStartDate);
                oTrimmedEndDate = UI5Date.getInstance(oEndDate);
                bAllDate = false;
                oModel = this.getView().getModel("allDay");
    
                if (!oAppointment.getSelected() && this._pDetailsPopover) {
                    this._pDetailsPopover.then(function(oResponsivePopover){
                        oResponsivePopover.close();
                    });
                    return;
                }
    
                this._setHoursToZero(oTrimmedStartDate);
                this._setHoursToZero(oTrimmedEndDate);
    
                if (oStartDate.getTime() === oTrimmedStartDate.getTime() && oEndDate.getTime() === oTrimmedEndDate.getTime()) {
                    bAllDate = true;
                }
    
                oModel.getData().allDay = bAllDate;
                oModel.updateBindings();
    
                if (!this._pDetailsPopover) {
                    this._pDetailsPopover = Fragment.load({
                        id: oView.getId(),
                        name: "com.leavetracker.leavetracker.Fragments.Details",
                        controller: this
                    }).then(function(oResponsivePopover){
                        oView.addDependent(oResponsivePopover);
                        return oResponsivePopover;
                    });
                }
                this._pDetailsPopover.then(function (oResponsivePopover) {
                    oResponsivePopover.setBindingContext(oAppointment.getBindingContext());
                    oResponsivePopover.openBy(oAppointment);
                });
            },
    
            handleMoreLinkPress: function(oEvent) {
                var oDate = oEvent.getParameter("date"),
                    oSinglePlanningCalendar = this.getView().byId("SPC1");
    
                oSinglePlanningCalendar.setSelectedView(oSinglePlanningCalendar.getViews()[2]); // DayView
    
                this.getView().getModel().setData({ startDate: oDate }, true);
            },
    
            handleEditButton: function () {
                // The sap.m.Popover has to be closed before the sap.m.Dialog gets opened
                var oDetailsPopover = this.byId("detailsPopover");
                oDetailsPopover.close();
                this.sPath = oDetailsPopover.getBindingContext().getPath();
                this._arrangeDialogFragment("Edit appointment");
            },
    
            handlePopoverDeleteButton: function () {
                var oModel = this.getView().getModel(),
                    oAppointments = oModel.getData().appointments,
                    oDetailsPopover = this.byId("detailsPopover"),
                    oAppointment = oDetailsPopover._getBindingContext().getObject();
    
                oDetailsPopover.close();
    
                oAppointments.splice(oAppointments.indexOf(oAppointment), 1);
                oModel.updateBindings();
            },
    
            _arrangeDialogFragment: function (sTitle) {
                var oView = this.getView();
    
                if (!this._pNewAppointmentDialog) {
                    this._pNewAppointmentDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.leavetracker.leavetracker.Fragments.Modify",
                        controller: this
                    }).then(function(oNewAppointmentDialog){
                        oView.addDependent(oNewAppointmentDialog);
                        return oNewAppointmentDialog;
                    });
                }
    
                this._pNewAppointmentDialog.then(function(oNewAppointmentDialog) {
                    this._arrangeDialog(sTitle, oNewAppointmentDialog);
                }.bind(this));
            },
    
            _arrangeDialog: function (sTitle, oNewAppointmentDialog) {
                this._setValuesToDialogContent(oNewAppointmentDialog);
                oNewAppointmentDialog.setTitle(sTitle);
                oNewAppointmentDialog.open();
            },
    
            _setValuesToDialogContent: function (oNewAppointmentDialog) {
                var oAllDayAppointment = this.byId("allDay"),
                    sStartDatePickerID = oAllDayAppointment.getSelected() ? "DPStartDate" : "DTPStartDate",
                    sEndDatePickerID = oAllDayAppointment.getSelected() ? "DPEndDate" : "DTPEndDate",
                    oTitleControl = this.byId("appTitle"),
                    oTextControl = this.byId("moreInfo"),
                    oTypeControl = this.byId("appType"),
                    oStartDateControl = this.byId(sStartDatePickerID),
                    oEndDateControl = this.byId(sEndDatePickerID),
                    oEmptyError = {errorState:false, errorMessage: ""},
                    oContext,
                    oContextObject,
                    oSPCStartDate,
                    sTitle,
                    sText,
                    oStartDate,
                    oEndDate,
                    sType;
    
    
                if (this.sPath) {
                    oContext = this.byId("detailsPopover").getBindingContext();
                    oContextObject = oContext.getObject();
                    sTitle = oContextObject.title;
                    sText = oContextObject.text;
                    oStartDate = oContextObject.startDate;
                    oEndDate = oContextObject.endDate;
                    sType = oContextObject.type;
                } else {
                    sTitle = "";
                    sText = "";
                    if (this._oChosenDayData) {
                        oStartDate = this._oChosenDayData.start;
                        oEndDate = this._oChosenDayData.end;
    
                        delete this._oChosenDayData;
                    } else {
                        oSPCStartDate = this.getView().byId("SPC1").getStartDate();
                        oStartDate = UI5Date.getInstance(oSPCStartDate);
                        oStartDate.setHours(this._getDefaultAppointmentStartHour());
                        oEndDate = UI5Date.getInstance(oSPCStartDate);
                        oEndDate.setHours(this._getDefaultAppointmentEndHour());
                    }
                    oAllDayAppointment.setSelected(false);
                    sType = "Type01";
                }
    
                oTitleControl.setValue(sTitle);
                oTextControl.setValue(sText);
                oStartDateControl.setDateValue(oStartDate);
                oEndDateControl.setDateValue(oEndDate);
                oTypeControl.setSelectedKey(sType);
                this._setDateValueState(oStartDateControl, oEmptyError);
                this._setDateValueState(oEndDateControl, oEmptyError);
                this.updateButtonEnabledState(oStartDateControl, oEndDateControl, oNewAppointmentDialog.getBeginButton());
            },
    
            handleDialogOkButton: function (oEvent) {
                var createdata = {};
                createdata.Title = this.byId("appTitle").getValue();
                createdata.ReasonForLeave = this.byId("moreInfo").getValue();
                var inputDateString  = this.byId("DPStartDate").getValue();

                
                // Parse the input date string
                var parsedDate = new Date(inputDateString);

                // Format the date into the desired pattern
                createdata.FromDate = formatTime(parsedDate);

                // Resulting formatted time
                //console.log(formattedDate);

                // Function to format the time
                function formatTime(date) {
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var year = date.getFullYear();

                // Pad single-digit hours and minutes with leading zero
                hours = hours < 10 ? "0" + hours : hours;
                minutes = minutes < 10 ? "0" + minutes : minutes;

                // Return the formatted time string
                return hours + ":" + minutes + ":" + year;
                }



                // // Parse the input string
                // var parsedDate = new Date(dateString);

                // // Format the date into a string compatible with Edm.DateTime
                // createdata.FromDate = parsedDate.toISOString();

        
                createdata.ToDate = this.byId("DPEndDate").getValue();

                // // Parse the input string
                // var parsedDate = new Date(dateStringg);

                // // Format the date into a string compatible with Edm.DateTime
                // createdata.ToDate= parsedDate.toISOString();


                createdata.AllDay = this.byId("allDay").getSelected(); // Use getSelected() for checkboxes
                createdata.LeaveType = this.byId("appType").getSelectedItem().getText(); // Assuming appType is a Select control
                var Model = this.getOwnerComponent().getModel();
                Model.create("/et_calendarSet",createdata,{
                        success: function (odata){
                            sap.m.MessageToast.show("Success");
                        
                        
                                        
                        }.bind(this), 
                        error: function (err) {
                        sap.m.MessageToast.show("Failed");
                        }
                    });


                
                var bAllDayAppointment = (this.byId("allDay")).getSelected(),
                    sStartDate = bAllDayAppointment ? "DPStartDate" : "DTPStartDate",
                    sEndDate = bAllDayAppointment ? "DPEndDate" : "DTPEndDate",
                    sTitle = this.byId("appTitle").getValue(),
                    sText = this.byId("moreInfo").getValue(),
                    sType = this.byId("appType").getSelectedItem().getKey(),
                    oStartDate = this.byId(sStartDate).getDateValue(),
                    oEndDate = this.byId(sEndDate).getDateValue(),
                    oModel = this.getView().getModel(),
                    sAppointmentPath;
    
                if (this.byId(sStartDate).getValueState() !== ValueState.Error
                    && this.byId(sEndDate).getValueState() !== ValueState.Error) {
    
                    if (this.sPath) {
                        sAppointmentPath = this.sPath;
                        oModel.setProperty(sAppointmentPath + "/title", sTitle);
                        oModel.setProperty(sAppointmentPath + "/text", sText);
                        oModel.setProperty(sAppointmentPath + "/type", sType);
                        oModel.setProperty(sAppointmentPath + "/startDate", oStartDate);
                        oModel.setProperty(sAppointmentPath + "/endDate", oEndDate);
                    } else {
                        oModel.getData().appointments.push({
                            title: sTitle,
                            text: sText,
                            type: sType,
                            startDate: oStartDate,
                            endDate: oEndDate
                        });
                    }
    
                    oModel.updateBindings();
    
                    this.byId("modifyDialog").close();
                }
            },
    
            formatDate: function (oDate) {
                if (oDate) {
                    var iHours = oDate.getHours(),
                        iMinutes = oDate.getMinutes(),
                        iSeconds = oDate.getSeconds();
    
                    if (iHours !== 0 || iMinutes !== 0 || iSeconds !== 0) {
                        return DateFormat.getDateTimeInstance({ style: "medium" }).format(oDate);
                    } else  {
                        return DateFormat.getDateInstance({ style: "medium" }).format(oDate);
                    }
                }
            },
    
            handleDialogCancelButton:  function () {
                this.sPath = null;
                this.byId("modifyDialog").close();
            },
    
            handleCheckBoxSelect: function (oEvent) {
                var bSelected = oEvent.getSource().getSelected(),
                    sStartDatePickerID = bSelected ? "DTPStartDate" : "DPStartDate",
                    sEndDatePickerID = bSelected ? "DTPEndDate" : "DPEndDate",
                    oOldStartDate = this.byId(sStartDatePickerID).getDateValue(),
                    oNewStartDate = UI5Date.getInstance(oOldStartDate),
                    oOldEndDate = this.byId(sEndDatePickerID).getDateValue(),
                    oNewEndDate = UI5Date.getInstance(oOldEndDate);
    
                if (!bSelected) {
                    oNewStartDate.setHours(this._getDefaultAppointmentStartHour());
                    oNewEndDate.setHours(this._getDefaultAppointmentEndHour());
                } else {
                    this._setHoursToZero(oNewStartDate);
                    this._setHoursToZero(oNewEndDate);
                }
    
                sStartDatePickerID = !bSelected ? "DTPStartDate" : "DPStartDate";
                sEndDatePickerID = !bSelected ? "DTPEndDate" : "DPEndDate";
                this.byId(sStartDatePickerID).setDateValue(oNewStartDate);
                this.byId(sEndDatePickerID).setDateValue(oNewEndDate);
            },
    
            _getDefaultAppointmentStartHour: function() {
                return 9;
            },
    
            _getDefaultAppointmentEndHour: function() {
                return 10;
            },
    
            _setHoursToZero: function (oDate) {
                oDate.setHours(0, 0, 0, 0);
            },
    
            handleAppointmentCreate: function () {
                this._createInitialDialogValues(this.getView().byId("SPC1").getStartDate());
            },
    
            handleHeaderDateSelect: function (oEvent) {
                this._createInitialDialogValues(oEvent.getParameter("date"));
            },
    
            _createInitialDialogValues: function (oDate) {
                var oStartDate = UI5Date.getInstance(oDate),
                    oEndDate = UI5Date.getInstance(oStartDate);
    
                oStartDate.setHours(this._getDefaultAppointmentStartHour());
                oEndDate.setHours(this._getDefaultAppointmentEndHour());
                this._oChosenDayData = {start: oStartDate, end: oEndDate };
                this.sPath = null;
    
                this._arrangeDialogFragment("Create Leave Request");
            },
    
            handleStartDateChange: function (oEvent) {
                var oStartDate = oEvent.getParameter("date");
                MessageToast.show("'startDateChange' event fired.\n\nNew start date is "  + oStartDate.toString());
            },
    
            updateButtonEnabledState: function (oDateTimePickerStart, oDateTimePickerEnd, oButton) {
                var bEnabled = oDateTimePickerStart.getValueState() !== ValueState.Error
                    && oDateTimePickerStart.getValue() !== ""
                    && oDateTimePickerEnd.getValue() !== ""
                    && oDateTimePickerEnd.getValueState() !== ValueState.Error;
    
                oButton.setEnabled(bEnabled);
            },
    
            handleDateTimePickerChange: function(oEvent) {
                var oDateTimePickerStart = this.byId("DTPStartDate"),
                    oDateTimePickerEnd = this.byId("DTPEndDate"),
                    oStartDate = oDateTimePickerStart.getDateValue(),
                    oEndDate = oDateTimePickerEnd.getDateValue(),
                    oErrorState = {errorState: false, errorMessage: ""};
    
                if (!oStartDate){
                    oErrorState.errorState = true;
                    oErrorState.errorMessage = "Please pick a date";
                    this._setDateValueState(oDateTimePickerStart, oErrorState);
                } else if (!oEndDate){
                    oErrorState.errorState = true;
                    oErrorState.errorMessage = "Please pick a date";
                    this._setDateValueState(oDateTimePickerEnd, oErrorState);
                } else if (!oEvent.getParameter("valid")){
                    oErrorState.errorState = true;
                    oErrorState.errorMessage = "Invalid date";
                    if (oEvent.getSource() === oDateTimePickerStart){
                        this._setDateValueState(oDateTimePickerStart, oErrorState);
                    } else {
                        this._setDateValueState(oDateTimePickerEnd, oErrorState);
                    }
                } else if (oStartDate && oEndDate && (oEndDate.getTime() <= oStartDate.getTime())){
                    oErrorState.errorState = true;
                    oErrorState.errorMessage = "Start date should be before End date";
                    this._setDateValueState(oDateTimePickerStart, oErrorState);
                    this._setDateValueState(oDateTimePickerEnd, oErrorState);
                } else {
                    this._setDateValueState(oDateTimePickerStart, oErrorState);
                    this._setDateValueState(oDateTimePickerEnd, oErrorState);
                }
    
                this.updateButtonEnabledState(oDateTimePickerStart, oDateTimePickerEnd, this.byId("modifyDialog").getBeginButton());
            },
    
            handleDatePickerChange: function () {
                var oDatePickerStart = this.byId("DPStartDate"),
                    oDatePickerEnd = this.byId("DPEndDate"),
                    oStartDate = oDatePickerStart.getDateValue(),
                    oEndDate = oDatePickerEnd.getDateValue(),
                    bEndDateBiggerThanStartDate = oEndDate.getTime() < oStartDate.getTime(),
                    oErrorState = {errorState: false, errorMessage: ""};
    
                if (oStartDate && oEndDate && bEndDateBiggerThanStartDate){
                    oErrorState.errorState = true;
                    oErrorState.errorMessage = "Start date should be before End date";
                }
                this._setDateValueState(oDatePickerStart, oErrorState);
                this._setDateValueState(oDatePickerEnd, oErrorState);
                this.updateButtonEnabledState(oDatePickerStart, oDatePickerEnd, this.byId("modifyDialog").getBeginButton());
            },
    
            _setDateValueState: function(oPicker, oErrorState) {
                if (oErrorState.errorState) {
                    oPicker.setValueState(ValueState.Error);
                    oPicker.setValueStateText(oErrorState.errorMessage);
                } else {
                    oPicker.setValueState(ValueState.None);
                }
            },
    
            handleOpenLegend: function (oEvent) {
                var oSource = oEvent.getSource(),
                    oView = this.getView();
    
                if (!this._pLegendPopover) {
                    this._pLegendPopover = Fragment.load({
                        id: oView.getId(),
                        name: "com.leavetracker.leavetracker.Fragments.Legend",
                        controller: this
                    }).then(function(oLegendPopover) {
                        oView.addDependent(oLegendPopover);
                        return oLegendPopover;
                    });
                }
    
                this._pLegendPopover.then(function(oLegendPopover) {
                    if (oLegendPopover.isOpen()){
                        oLegendPopover.close();
                    } else {
                        oLegendPopover.openBy(oSource);
                    }
                });
            }
        });
    });
    
    // sap.ui.define([
    //     "sap/ui/core/mvc/Controller"
    // ],
    //     /**
    //      * @param {typeof sap.ui.core.mvc.Controller} Controller
    //      */
    //     function (Controller) {
    //         "use strict";
    
    //         return Controller.extend("d.singleplanningcalendar.controller.View", {
    //             onInit: function () {
    
    //             }
    //         });
    //     });