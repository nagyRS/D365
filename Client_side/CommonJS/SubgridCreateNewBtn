// -- 1. create new Opportunity from the subgrid -- 
// registered with Ribbon workbench new button/control/command

function newOpportunity(executionContext, gridContext){

    try{
        var formContext = executionContext;
        var mainEntity = formContext.data.entity.getEntityName();
        var gridEntity = gridContext.getEntityName();
        var formParameters = {};

        switch(mainEntity){
            
            case "account":
                formParameters["parentaccountid"] = formContext.data.entity.getId();
                formParameters["parentaccountidname"] = formContext.getAttribute("name").getValue();

                // if there is a primary contact add to the new opportunity form
                var primaryContact = formContext.getAttribute("primarycontactid").getValue();
                if(primaryContact != null){
                    formParameters["parentcontactid"] = primaryContact[0].id;
                    formParameters["parentcontactidname"] = primaryContact[0].name;
                }

                // if no CSE 
                if(formContext.getAttribute("rxn__cse").getValue() == null){
                    var confirmStrings = { text:"Select OK to continue or Cancel to stay on this page.", title:"Warning" };
                    var confirmOptions = { height: 200, width: 450 };
                    Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
                        function (success) {    
                            if (success.confirmed)
                            openNewForm("opportunity", formParameters);
                            else
                            console.log("Dialog closed using Cancel button.");
                        });
                }
                else{

                    openNewForm("opportunity", formParameters);
                }
                break;

            case "contact":
                formParameters["parentcontactid"] = formContext.data.entity.getId();
                formParameters["parentcontactidname"] = formContext.getAttribute("firstname").getValue() + " " + formContext.getAttribute("lastname").getValue();


                // check if Private client is Yes and CSE is populated
                var isPrivateClient = formContext.getAttribute("rxn__privateclient").getValue();
                if(isPrivateClient == true){
                    formParameters["rxn__privateclient"] = true;
                }
    
                var hasCse = formContext.getAttribute("rxn__cse").getValue();

                if(!isPrivateClient || !hasCse){
                    var confirmStrings = { text:"Please ensure that both these fields are completed before proceeding.", 
                                           title:"Warning",
                                           cancelButtonLabel:"Proceed",
                                           confirmButtonLabel:"Stay on page"
                                          };
                    var confirmOptions = { height: 200, width: 450 };
                    Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
                            function (success) {    
                                if (success.confirmed){
                                    console.log("clicked OK button");
                                }
                                else{
                                    openNewForm("opportunity", formParameters);
                                    console.log("Dialog closed using Cancel button.");
                                }
                            });

                }
                else{
                openNewForm("opportunity", formParameters);
                }
                break;

            default:
                var entityFormOptions = {};
                entityFormOptions["entityName"] = gridEntity;
                
                //parent record details for the lookup
                entityFormOptions["createFromEntity"] = {
                    entityType : mainEntity,
                    id : formContext.data.entity.getId()
                }

                Xrm.Navigation.openForm(entityFormOptions).then(
                    function (success){
                        console.log(success);
                    },
                    function(error){
                        console.log(error);
                    }
                );

        }
    }
    catch(err){
        Xrm.Navigation.openAlertDialog(err.message);
    }

}

// --2. create new Lead from the subgrid --
function newLead(executionContext, gridContext){
    try{
        var formContext = executionContext;
        var mainEntity = formContext.data.entity.getEntityName();
        var gridEntity = gridContext.getEntityName();
        var formParameters = {};

        switch(mainEntity){

            case "account":
                formParameters["parentaccountid"] = formContext.data.entity.getId();
                formParameters["parentaccountidname"] = formContext.getAttribute("name").getValue();

                // if there is a primary contact add to the new lead form
                var primaryContact = formContext.getAttribute("primarycontactid").getValue();
                if(primaryContact != null){
                    formParameters["parentcontactid"] = primaryContact[0].id;
                    formParameters["parentcontactidname"] = primaryContact[0].name;
                }

                openNewForm("lead", formParameters);
                break;

            case "contact":
                formParameters["parentcontactid"] = formContext.data.entity.getId();
                formParameters["parentcontactidname"] = formContext.getAttribute("firstname").getValue() + " " + formContext.getAttribute("lastname").getValue();
                formParameters["firstname"] = formContext.getAttribute("firstname").getValue();
                formParameters["lastname"] = formContext.getAttribute("lastname").getValue();
                formParameters["jobtitle"] = formContext.getAttribute("jobtitle").getValue();
                formParameters["mobilephone"] = formContext.getAttribute("mobilephone").getValue();
                formParameters["emailaddress1"] = formContext.getAttribute("emailaddress1").getValue();
                formParameters["telephone1"] = formContext.getAttribute("telephone1").getValue();
                
                openNewForm("lead", formParameters);
                break;

            default:
                var entityFormOptions = {};
                entityFormOptions["entityName"] = gridEntity;
                
                //parent record details for the lookup
                entityFormOptions["createFromEntity"] = {
                    entityType : mainEntity,
                    id : formContext.data.entity.getId()
                }

                Xrm.Navigation.openForm(entityFormOptions).then(
                    function (success){
                        console.log(success);
                    },
                    function(error){
                        console.log(error);
                    }
                );
            

        }

    }
    catch(err){
        Xrm.Navigation.openAlertDialog(err.message);
    }

}

// --3. Utility --
function openNewForm(entityName, formParameters){

    
    var entityFormOptions = {};
    entityFormOptions["entityName"] = entityName;

    Xrm.Navigation.openForm(entityFormOptions, formParameters).then(
        function (success){
            console.log(success);
        },
        function(error){
            console.log(error);
        }
    );
}
