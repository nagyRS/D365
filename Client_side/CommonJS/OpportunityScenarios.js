var Nspc = window.Nspc || {};


// 1. Displays missing CSE warning
// registered on Form load
Nspc.displayCseNotification = function(executionContext){

    var formContext = executionContext.getFormContext();
	// clear previous notification
	formContext.ui.clearFormNotification("CseWarning_C");
	formContext.ui.clearFormNotification("CseWarning_A");
    
	// check if Private individual?
	var isPrivate = formContext.getAttribute("rxn_privateclient").getValue();

	if(isPrivate){
		var parentContact = formContext.getAttribute("parentcontactid").getValue();
        if(parentContact){
            var parentContactId = parentContact[0].id.replace(/[{}]/g, "");

            Xrm.WebApi.online.retrieveRecord("contact", parentContactId, "?$select=contactid,_rxn_cse_value").then(
                function success(result) {
                    console.log(result);
                    // Columns
                    var contactid = result["contactid"]; // Guid
                    var cse = result["_rxn_cse_value"]; // Lookup
                    var cse_formatted = result["_rxn_cse_value@OData.Community.Display.V1.FormattedValue"];
                    var cse_lookuplogicalname = result["_rxn_cse_value@Microsoft.Dynamics.CRM.lookuplogicalname"];

                    if(!cse){
                        var message = "The contact selected does not have an officer.";
                        var level = "ERROR";
                        var contactWarningId = "CseWarning_C";
                        formContext.ui.setFormNotification(message, level, contactWarningId);
                    }
                },
                function(error) {
                    console.log(error.message);
                }
            );
        }
	}
	else{
		var parentAccount = formContext.getAttribute("parentaccountid").getValue();
        
        if(parentAccount){
            var parentAccountId = parentAccount[0].id.replace(/[{}]/g, "");

            Xrm.WebApi.online.retrieveRecord("account", parentAccountId, "?$select=accountid,_rxn_cse_value").then(
                function success(result) {
                    console.log(result);
                    // Columns
                    var accountid = result["accountid"]; // Guid
                    var cse = result["_rxn_cse_value"]; // Lookup
                    var cse_formatted = result["_rxn_cse_value@OData.Community.Display.V1.FormattedValue"];
                    var cse_lookuplogicalname = result["_rxn_cse_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
				
                    if(!cse){
                        var message = "The account selected has no officer.";
                        var level = "ERROR";
                        var accountWarningId = "CseWarning_A";
                        formContext.ui.setFormNotification(message, level, accountWarningId);
                    }

                },
                function(error) {
                    console.log(error.message);
                }
            );
        }
	}
}


// 2. Removes 'Re-tender' from New/Existing. 
// Removes Channel's Retender option if New/Existing is not Existing client
// Events: form OnLoad, New/Existing onChange
Nspc.removeRetenderOption = function(executionContext){
    var formContext = executionContext.getFormContext();

	var typeControl = formContext.getControl("rxn_type");
	if(typeControl){
		typeControl.removeOption(866800002); //Re-tender
	}

    var typeValue = formContext.getAttribute("rxn_type").getValue();
    var channelControl = formContext.getControl("rxn_channel");
	
	//any unsaved changes on the New/Existing column?
	var isTypeDirty = formContext.getAttribute("rxn_type").getIsDirty(); 

	//if it has been changed one or more times
	if(isTypeDirty || isTypeDirty === undefined){
		if (typeValue === 866800000){
			channelControl.removeOption(866800002);
    	}
   		else{
			var retenderOption = {
					text: "Retender",
					value: 866800002
				}
			channelControl.addOption(retenderOption, 3);    
		} 
	}
	//clean state on form load
	else{	 
		if (typeValue === 866800001){
			return; //if Existing, don't add another Retender
		}
		else {
			channelControl.removeOption(866800002);
		}
	} 
}

// 3. Filters Source lookup values
// Events: New/Existing and Channel OnChange
// added to PreSearch event of lookup column
Nspc.filterSource = function(executionContext){
	
	var formContext = executionContext.getFormContext();
	
	var type = formContext.getAttribute("rxn_type").getValue();  // New/Existing
	var channel = formContext.getAttribute("rxn_channel").getValue();
	
	// disregard if they are empty
	if(type != null && channel != null){   
    	formContext.getAttribute("rxn_leadsource").setValue(null);
    	formContext.getControl("rxn_leadsource").addPreSearch(Nspc.sourceFilter);
	}
}

Nspc.sourceFilter = function(executionContext){
	
	var fC = executionContext.getFormContext();
	var type1 = fC.getAttribute("rxn_type").getValue();
	var channel1 = fC.getAttribute("rxn_channel").getValue();
	
	// if New and Direct
	if(type1 === 866800000 && channel1 === 866800000 )
	{
		var fetchXml = "<filter type='and'><condition attribute='rxn_newclient' operator='eq' value='1' /><condition attribute='rxn_direct' operator='eq' value='1' /></filter>";
		fC.getControl("rxn_leadsource").addCustomFilter(fetchXml, "rxn_leadsource");
	}
	// if Existing and Direct
	else if(type1 === 866800001 && channel1 === 866800000)
	{
		var fetchXml = "<filter type='and'><condition attribute='rxn_existingclient' operator='eq' value='1' /><condition attribute='rxn_direct' operator='eq' value='1' /></filter>";
		fC.getControl("rxn_leadsource").addCustomFilter(fetchXml, "rxn_leadsource");
	}
	// if Referral
	else if(channel1 === 866800001)
	{
		var fetchXml = "<filter type='and'><condition attribute='rxn_referralin' operator='eq' value='1' /></filter>";
		fC.getControl("rxn_leadsource").addCustomFilter(fetchXml, "rxn_leadsource");
	}
	//if Retender
	else if(channel1 === 866800002)
	{
		var fetchXml = "<filter type='and'><condition attribute='rxn_retender' operator='eq' value='1' /></filter>";
		fC.getControl("rxn_leadsource").addCustomFilter(fetchXml, "rxn_leadsource");
	}
}


// 4. Populates Referral in account with  Referral in contact's parent account
// Event: Referral in contact OnChange
Nspc.populateReferralInAccount = function(executionContext){
	var formContext = executionContext.getFormContext();
	var refInContact = formContext.getAttribute("rxn_referralincontact").getValue();
	
	if (refInContact){
		var Id = refInContact[0].id.replace(/[{}]/g, "");
		
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
				var refInAccountAttribute = formContext.getAttribute("rxn_referralinaccount");
				privateclient ? refInAccountAttribute.setRequiredLevel("none") : refInAccountAttribute.setRequiredLevel("required");

				// populate ref in account with ref in contact's account
				if(parentcustomerid){
					var accountLookup = new Array();
                	accountLookup[0] = 
					{
						entityType: parentcustomerid_lookuplogicalname,
						id: parentcustomerid,
						name: parentcustomerid_formatted				
					}
				
					refInAccountAttribute.setValue(accountLookup);
				}
			},
			function(error) {
				console.log(error.message);
			}
		);	
	}
    else{
        formContext.getAttribute("rxn_referralinaccount").setValue(null);
    }
			
}

// 5. Shows and filters Source Type field based on parent Source
// Event: Form onLoad and Source onChange
Nspc.displaySourceType = function(executionContext){

    var formContext = executionContext.getFormContext();

    var source = formContext.getAttribute("rxn_leadsource").getValue();
    var sourceTypeControl = formContext.getControl("rxn_sourcetype");
    var sourceTypeAttribute = formContext.getAttribute("rxn_sourcetype");

    if(source){
		// retrun Source types where the parent Source is this source
		Xrm.WebApi.online.retrieveMultipleRecords("rxn_sourcetype", "?$select=rxn_sourcetypeid,rxn_name,_rxn_parentsource_value,statecode&$filter=(statecode eq 0 and _rxn_parentsource_value eq " + source[0].id + ")").then(
			function success(results) {
				console.log(results);
				
                if (results.entities.length > 0){
					sourceTypeControl.setVisible(true);
                    sourceTypeAttribute.setRequiredLevel("required");
					sourceTypeControl.addPreSearch(Nspc.filterSourceType);
				}
                else{
                    sourceTypeAttribute.setValue(null);
                    sourceTypeAttribute.setRequiredLevel("none");
                    sourceTypeControl.setVisible(false);
                }
				
			},
			function(error) {
				console.log(error.message);
			}
		);

    }
    else{
		sourceTypeAttribute.setValue(null);
        sourceTypeAttribute.setRequiredLevel("none");
        sourceTypeControl.setVisible(false);
    }
    
}

Nspc.filterSourceType = function(executionContext){
	var formCont = executionContext.getFormContext();
	var sourceObj = formCont.getAttribute("rxn_leadsource").getValue();

	var parentSourceFilter = '<filter type="and"><condition attribute="rxn_parentsource" operator="eq" uiname="' + sourceObj[0].name + '" uitype="rxn_leadsource" value="' + sourceObj[0].id + '" /></filter>'
	formCont.getControl("rxn_sourcetype").addCustomFilter(parentSourceFilter, "rxn_sourcetype");
}

// 6. Sets 'Nspc Member Firms' view as default for Referral in account lookup if Source = 'Nspc International network' 
// Events: form OnLoad and rxn_leadsource OnChange
Nspc.selectNspcMemberFirmView = function(executionContext){

	let formContext = executionContext.getFormContext();
	var leadSource = formContext.getAttribute("rxn_leadsource").getValue();

	if (leadSource){

		let leadSourceName = leadSource[0].name.toLowerCase();

		if (leadSourceName === "Nspc international network"){

			formContext.getControl("rxn_referralinaccount").setDefaultView("{76621B80-2257-EB11-A812-000D3AB11761}");
		}
		else{
			formContext.getControl("rxn_referralinaccount").setDefaultView("{A9AF0AB8-861D-4CFA-92A5-C6281FED7FAB}");
		}
	}
}
//7. hide options for pricing strategy
// registered on Form load

Nspc.hideoptions = function(executionContext){
    var formContext = executionContext.getFormContext();
    var pricingGcrsControl = formContext.getControl("header_process_rxn_pricingstrategygcrsonly");

    if(pricingGcrsControl){
        pricingGcrsControl.removeOption(866800003);
        pricingGcrsControl.removeOption(866800004);
        pricingGcrsControl.removeOption(866800005);
    }
}

//8. Prevents Opportunity bpf from progressing if no service lines attached
// Events: form OnLoad
// added to PreStageChange event
Nspc.formLoad = function(e) {
    var fc = e.getFormContext();
    fc.data.process.addOnPreStageChange(Nspc.handlePreStage);
};
Nspc.handlePreStage = function(e) {
    var bpfArgs = e.getEventArgs();
    var fc = e.getFormContext();
    var getActiveStage = fc.data.process.getActiveStage();

    if (bpfArgs.getDirection() === "Next" && getActiveStage.getId() == "e7c317f9-c6a3-4ee6-8b5b-13c093f83479") { // only next stage movement is allowed. running based on the Guid of the process stage
        // stop the stage movement
        var serviceLineCount = fc.getControl("ServiceLines").getGrid().getTotalRecordCount(); //checks for service lines on the subgrid attached to the opportunity form - pot. rework using web.api

        if (serviceLineCount < 1) {
            bpfArgs.preventDefault();
            alertStrings = { confirmButtonLabel: "OK", text: "You must add a child record to the parent opportunity before progressing to the next stage", title: "Warning" };
            alertOptions = { height: 120, width: 260 };
            Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
        }
    }
}

//9. hide options form outcome Won - signed
// registered on Form load

Nspc.outcomehideoptions = function(executionContext){
    var formContext = executionContext.getFormContext();
    var outcomeControl = formContext.getControl("header_process_rxn_outcome");
    
    if(outcomeControl){
        var outcomeAttr = formContext.getAttribute("rxn_outcome");
        
        if(outcomeAttr){
            var outcomeValue = outcomeAttr.getValue();
            
            if(outcomeValue !== 866800007){
                outcomeControl.removeOption(866800007);
            }
        }
    }
}
// 10. Lock outcome filed other than outcome stage

Nspc.lockoutcome = function(executionContext){
 
    var formContext = executionContext.getFormContext();
Nspc.stageOnChange(executionContext);
 formContext.data.process.addOnStageChange(Nspc.stageOnChange);
//formContext.data.process.addOnStageSelected(stageOnChange(executionContext));
}


Nspc.stageOnChange=function(executionContext)
{
var formContext = executionContext.getFormContext();
 var stage = formContext.data.process.getActiveStage();
if(stage!= null&& stage!= undefined)
{
    var StageName = stage.getName();
    if (StageName.toLowerCase() == "outcome") {
        
		if(formContext.getControl("header_process_rxn_outcome")!=null && formContext.getControl("header_process_rxn_outcome")!=undefined)
		{
            formContext.getControl("header_process_rxn_outcome").setDisabled(false);
		}
		if(formContext.getControl("header_process_rxn_outcome_1")!=null && formContext.getControl("header_process_rxn_outcome_1")!=undefined)
	 {
formContext.getControl("header_process_rxn_outcome_1").setDisabled(false);
	 }
	 if(formContext.getControl("header_process_rxn_outcome_2")!=null && formContext.getControl("header_process_rxn_outcome_2")!=undefined)
	 {
formContext.getControl("header_process_rxn_outcome_2").setDisabled(false);
	 }
        
 }
 else{
	 if(formContext.getControl("header_process_rxn_outcome")!=null && formContext.getControl("header_process_rxn_outcome")!=undefined)
	 {
	 formContext.getControl("header_process_rxn_outcome").setDisabled(true);
	 }
	 if(formContext.getControl("header_process_rxn_outcome_1")!=null && formContext.getControl("header_process_rxn_outcome_1")!=undefined)
	 {
formContext.getControl("header_process_rxn_outcome_1").setDisabled(true);
	 }
	 if(formContext.getControl("header_process_rxn_outcome_2")!=null && formContext.getControl("header_process_rxn_outcome_2")!=undefined)
	 {
formContext.getControl("header_process_rxn_outcome_2").setDisabled(true);
	 }
 }
}

}