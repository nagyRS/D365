
var Nspc = window.Nspc || {};


//prevent users saving the SL record if the Opportunity is private but the contact isn't
//Events: form OnSave
Nspc.preventRecordSave = function(executionContext){

    var formContext = executionContext.getFormContext();

    //only run on create forms
    var formType = formContext.ui.getFormType();
    if(formType === 1){

        var opportunity = formContext.getAttribute("rxn_opportunityid").getValue();
        var oppId = opportunity[0].id.replace(/[{}]/g, "");

        var contact = formContext.getAttribute("rxn_contact").getValue();
        
        // only proceed if there is a contact
        if(contact){
            var contId = contact[0].id.replace(/[{}]/g, "");

            //Find Opportunity
            var req1 = new XMLHttpRequest();
            req1.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.2/opportunities("+ oppId +")?$select=rxn_privateclient", false);
            req1.setRequestHeader("OData-MaxVersion", "4.0");
            req1.setRequestHeader("OData-Version", "4.0");
            req1.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            req1.setRequestHeader("Accept", "application/json");
            req1.setRequestHeader("Prefer", "odata.include-annotations=*");
            req1.onreadystatechange = function () {
                if (this.readyState === 4) {
                    req1.onreadystatechange = null;
                    if (this.status === 200) {
                        var result = JSON.parse(this.response);
                        console.log(result);
                        // Columns
                        var opportunityid = result["opportunityid"]; // Guid
                        var isOppPrivate = result["rxn_privateclient"]; // Boolean
                        var rxn_privateclient_formatted = result["rxn_privateclient@OData.Community.Display.V1.FormattedValue"];

                        if(isOppPrivate){
                            var req2 = new XMLHttpRequest();
                            req2.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.2/contacts("+ contId +")?$select=rxn_privateclient", false);
                            req2.setRequestHeader("OData-MaxVersion", "4.0");
                            req2.setRequestHeader("OData-Version", "4.0");
                            req2.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                            req2.setRequestHeader("Accept", "application/json");
                            req2.setRequestHeader("Prefer", "odata.include-annotations=*");
                            req2.onreadystatechange = function () {
                                if (this.readyState === 4) {
                                    req2.onreadystatechange = null;
                                    if (this.status === 200) {
                                        var result = JSON.parse(this.response);
                                        console.log(result);
                                        // Columns
                                        var contactid = result["contactid"]; // Guid
                                        var isContPrivate = result["rxn_privateclient"]; // Boolean
                                        var rxn_privateclient_formatted = result["rxn_privateclient@OData.Community.Display.V1.FormattedValue"];

                                        if(!isContPrivate){
                                            executionContext.getEventArgs().preventDefault();
                                            alertStrings = { confirmButtonLabel: "OK", text: "The record cannot be saved as the opportunity contact is not a private client. Go back to the contact record and tick private client.", title: "Warning" };
                                            alertOptions = { height: 120, width: 260 };
                                            Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
                                            
                                        }
                                        
                                    } else {
                                        console.log(this.responseText);
                                    }
                                }
                            };
                            req2.send();
                        }
                        
                    } else {
                        console.log(this.responseText);
                    }
                }
            };
            req1.send();
        }
    }
}