// Service line main form


var Nspc = window.Nspc || {};

// 1. hides Status field and CEAP PASO section on create form
// Events: Form onLoad
Nspc.hideStatus = function(executionContext){
    var formContext = executionContext.getFormContext();

    var formType = formContext.ui.getFormType();
    formContext.getControl("rxn_status").setVisible(formType != 1);
    formContext.ui.tabs.get("General_tab_Catalyst").sections.get("Ceap_Paso_section_Catalyst_main").setVisible(formType != 1);
}

// 2. sets the default status when record is created. The status is unassigned as default
// Event: Service group onChange
Nspc.setDefaultStatus = function(executionContext){
    var formContext = executionContext.getFormContext();

    var formType = formContext.ui.getFormType();

    // only on the a create form
    if(formType === 1){
        var statusValue = formContext.getAttribute("rxn_status").getValue();

        // only if empty
        if(!statusValue){
            var serviceGroup = formContext.getAttribute("rxn_serviceline").getValue();
            
            if(serviceGroup){
                var sgValue = serviceGroup[0].name;
                
                if(sgValue.includes("Referred") || sgValue.includes("Referral")){
                    formContext.getAttribute("rxn_status").setValue(5); // Referral out
                }
                else formContext.getAttribute("rxn_status").setValue(0); //Open
            }
        }
    }
}

// 3. Locks ESE and Service group fields
// Events: Form onLoad
Nspc.lockFieldsOnLoad = function(executionContext){
    var formContext = executionContext.getFormContext();

    var serviceGroup = "rxn_serviceline";
    var ese = "rxn_ese";

    var sgValue = formContext.getAttribute(serviceGroup).getValue();
    var eseValue = formContext.getAttribute(ese).getValue();

    if (sgValue){
        formContext.getControl(serviceGroup).setDisabled(true);      
    }
    else{
    formContext.getControl(serviceGroup).setDisabled(false);
    }

    if(eseValue){
    formContext.getControl(ese).setDisabled(true);
    }
    else{
        formContext.getControl(ese).setDisabled(false);
    }

}

// 4. Filter Status options
// Events: From onLoad
Nspc.filterStatusOptions = function(executionContext){
    var formContext = executionContext.getFormContext();


    var statusControl = formContext.getControl("rxn_status");
    var serviceGroup = formContext.getAttribute("rxn_serviceline").getValue();
    var statusValue = formContext.getAttribute("rxn_status").getValue();
    
    if(serviceGroup){
        var sgValue = serviceGroup[0].name;
    }
     

    if (statusControl.getVisible()){

        // lock when 'Won - STC' and 'Won - signed' so cannot be modified anymore
        if(statusValue === 1 || statusValue === 8){
            statusControl.setDisabled(true);
        }           
        var isStatusDisabled = statusControl.getDisabled();

        if(!isStatusDisabled){
            if(sgValue.includes("Referred") || sgValue.includes("Referral")){

                statusControl.removeOption(0);  // Open
                statusControl.removeOption(1);  // Won STC
                statusControl.removeOption(8);  // Won - signed
                statusControl.removeOption(2);  // Lost
                statusControl.removeOption(3);  // Declined
                statusControl.removeOption(4);  // No longer interested
                statusControl.removeOption(10); // Delayed  
            }
            else{
                statusControl.removeOption(5);  // Referral out
                statusControl.removeOption(6);  // Referral out - won
                statusControl.removeOption(7);  // Referral out - lost
                statusControl.removeOption(1);  // Won STC
                statusControl.removeOption(8);  // Won - signed
                }    
        }
    }

}



// 5. Sets Referral out account to Referral out contact's parent account
// Events: Referral out contact OnChange
Nspc.populateReferralOutAccount = function(executionContext){
	var formContext = executionContext.getFormContext();
	var refOutContact = formContext.getAttribute("rxn_referraloutcontact").getValue();
	
	if (refOutContact){
		var Id = refOutContact[0].id.replace(/[{}]/g, "");
		
		Xrm.WebApi.online.retrieveRecord("contact", Id, "?$select=contactid,_parentcustomerid_value,fullname,rxn_privateclient").then(
			function success(result) {
				console.log(result);
				// Columns
				var contactid = result["contactid"]; // Guid
				var parentcustomerid = result["_parentcustomerid_value"]; // Customer
				var parentcustomerid_formatted = result["_parentcustomerid_value@OData.Community.Display.V1.FormattedValue"];
				var parentcustomerid_lookuplogicalname = result["_parentcustomerid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
				var privateclient = result["rxn_privateclient"]; // Boolean
				var privateclient_formatted = result["rxn_privateclient@OData.Community.Display.V1.FormattedValue"];
                
				// if private client make account non-mandatory
				var refOutAccountAttribute = formContext.getAttribute("rxn_referraloutaccount");
				privateclient ? refOutAccountAttribute.setRequiredLevel("none") : refOutAccountAttribute.setRequiredLevel("required");

				// populate ref out account with ref out contact's account
				if(parentcustomerid){
					var accountLookup = new Array();
                	accountLookup[0] = 
					{
						entityType: parentcustomerid_lookuplogicalname,
						id: parentcustomerid,
						name: parentcustomerid_formatted				
					}
				
					refOutAccountAttribute.setValue(accountLookup);
				}
			},
			function(error) {
				console.log(error.message);
			}
		);	
	}
    else{
        formContext.getAttribute("rxn_referraloutaccount").setValue(null);
    }
			
}

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
                                            alertStrings = { confirmButtonLabel: "OK", text: "The service line cannot be saved as the opportunity contact is not a private client. Go back to the contact record and tick private client.", title: "Warning" };
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