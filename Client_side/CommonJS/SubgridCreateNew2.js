// displays pop-up notification before creating a new Service line if the parent account/contact does not have a CSE
// registered on the subgrid on Opportunity main from when Add new SL

function newServiceLine(executionContext, gridContext){

    try{
        var formContext = executionContext;
        var mainEntity = formContext.data.entity.getEntityName();
        var gridEntity = gridContext.getEntityName();
        var isPrivate = formContext.getAttribute("rxn_privateclient").getValue();

        if(mainEntity === "opportunity" && gridEntity === "rxn_serviceline"){

            // required parameters to open a new form
            var entityFormOptions = {};
            entityFormOptions["entityName"] = gridEntity;
            entityFormOptions["createFromEntity"] = {
                entityType : mainEntity,
                id : formContext.data.entity.getId()
            }
       
            // if private opportunity then check if Contact has got a CSE
            if(isPrivate){  
                var parentContact = formContext.getAttribute("parentcontactid").getValue();
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
                            var confirmStrings = { text:"Update the record before proceeding. ", title:"Warning"};
                            var confirmOptions = { height: 200, width: 450 };
                            Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
                                function (success){    
                                    if (success.confirmed){
                                        Xrm.Navigation.openForm(entityFormOptions);
                                    }
                                    else
                                        console.log("Dialog closed using Cancel button.");
                                },
                                function(error){
                                    console.log(error);
                                }
                            );
                        }
                        else{
                            Xrm.Navigation.openForm(entityFormOptions);
                        }                     
                    },
			        function(error) {
				        console.log(error.message);
			        }
		        );
            }

            // if not a private opportunity then check if Account has got a CSE
            else{
                var parentAccount = formContext.getAttribute("parentaccountid").getValue();
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
                            var confirmStrings = { text:"Update the record before proceeding", title:"Warning"};
                            var confirmOptions = { height: 200, width: 450 };
                            Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
                                function (success){    
                                    if (success.confirmed){
                                        Xrm.Navigation.openForm(entityFormOptions);
                                    }
                                    else
                                        console.log("Dialog closed using Cancel button.");
                                },
                                function(error){
                                    console.log(error);
                                }
                            );
                        }
                        else{
                            Xrm.Navigation.openForm(entityFormOptions);
                        }
			        },
			        function(error) {
				        console.log(error.message);
                    }
                );      
            }    
        }
    }
    catch(err){
        Xrm.Navigation.openAlertDialog(err.message);
    }
}