
var Nspc_BDActivities_Ribbon_New = function (formContext, gridContext) {
    'use strict';

    //change

	// var entityName = formContext.data.entity.getEntityName();
	//var entityName = formContext.getEntityName();

    // registered on the grid 
    // removes the Add New and Add Existing buttons on if the grid belongs to a certain enity therefore they become read-only
	
    
	var entityName = formContext._entityName;
    var gridName = gridContext.getGrid().controlName;
    
    if (entityName === "pub_bdplan")
    {
        switch (gridName)
        {
            case "RelatedActivities":
                return true;

            case "NationalBDActivitiesGrid":
                return false;

            case "OfficeBDActivitiesGrid":
                return false;

            case "SectorBDActivitiesGrid":
                return false;

            case "ServiceLineBDActivitiesGrid":
                return false;
        }
    }

    if (entityName === "pub_bdinitiative") {
        switch (gridName) {
            case "BDActivities":
                return true;
        }
    }

    return true;
}

var Nspc_BDActivities_Ribbon_Existing = function (formContext, gridContext)
{
    'use strict';

    var entityName = formContext._entityName;
    var gridName = gridContext.getGrid().controlName;

    if (entityName === "pub_bdplan") {
        switch (gridName) {
            case "RelatedActivities":
                return false;

            case "NationalBDActivitiesGrid":
                return false;

            case "OfficeBDActivitiesGrid":
                return false;

            case "SectorBDActivitiesGrid":
                return false;

            case "ServiceLineBDActivitiesGrid":
                return false;
        }
    }

    if (entityName === "pub_bdinitiative") {
        switch (gridName) {
            case "BDActivities":
                return false;
        }
    }

    return true;
}

//
//

var Nspc_BDPlanObjectives_Ribbon_New = function (formContext, gridContext) {
    'use strict';

    var entityName = formContext._entityName;
    var gridName = gridContext.getGrid().controlName;

    if (entityName === "pub_bdplan") {
        switch (gridName) {
            case "BDPlanObjectives":
                return true;
        }
    }

    return true;
}

var Nspc_BDPlanObjectives_Ribbon_Existing = function (formContext, gridContext) {
    'use strict';

    var entityName = formContext._entityName;
    var gridName = gridContext.getGrid().controlName;

    if (entityName === "pub_bdplan") {
        switch (gridName) {
            case "BDPlanObjectives":
                return false;
        }
    }

    return true;
}

//
//

var Nspc_BDCampaigns_Ribbon_New = function (formContext, gridContext) {
    'use strict';

    var entityName = formContext._entityName;
    var gridName = gridContext.getGrid().controlName;

    if (entityName === "pub_bdplan") {
        switch (gridName) {
            case "RelatedInitiatives":
                return true;
        }
    }

    return true;
}

var Nspc_BDCampaigns_Ribbon_Existing = function (formContext, gridContext) {
    'use strict';

    var entityName = formContext._entityName;
    var gridName = gridContext.getGrid().controlName;

    if (entityName === "pub_bdplan") {
        switch (gridName) {
            case "RelatedInitiatives":
                return false;
        }
    }

    return true;
}

//
//

var Nspc_Accounts_Ribbon_New = function (formContext, gridContext) {
    'use strict';

    var entityName = formContext._entityName;
    var gridName = gridContext.getGrid().controlName;

    if (entityName === "pub_bdplan") {
        switch (gridName) {
            case "GoldSilverBronzeTargetAccounts":
                return false;
        }
    }

    return true;
}

var Nspc_Accounts_Ribbon_Existing = function (formContext, gridContext) {
    'use strict';

    var entityName = formContext._entityName;
    var gridName = gridContext.getGrid().controlName;

    if (entityName === "pub_bdplan") {
        switch (gridName) {
            case "GoldSilverBronzeTargetAccounts":
                return false;
        }
    }

    return true;
}

//
//

var Nspc_Leads_Ribbon_New = function (formContext, gridContext) {
    'use strict';

    var entityName = formContext._entityName;
    var gridName = gridContext.getGrid().controlName;

    if (entityName === "pub_bdplan" || entityName === "pub_bdinitiative")
    {
        return false;
    }

    if (entityName === "pub_bdactivity")
    {
        return false;
    }

    return true;
}

var Nspc_Leads_Ribbon_Existing = function (formContext, gridContext) {
    'use strict';

    var entityName = formContext._entityName;
    var gridName = gridContext.getGrid().controlName;

    if (entityName === "pub_bdplan" || entityName === "pub_bdinitiative") {
        return false;
    }

    if (entityName === "pub_bdactivity") {
        return false;
    }

    return true;
}




var Nspc_Opportunities_Ribbon_New = function (formContext, gridContext) {
    'use strict';

    var entityName = formContext._entityName;
    var gridName = gridContext.getGrid().controlName;

    if (entityName === "pub_bdplan" || entityName === "pub_bdinitiative") {
        return false;
    }

    if (entityName === "pub_bdactivity") {
       return false;
    }

    //return true;
}

var Nspc_Opportunities_Ribbon_Existing = function (formContext, gridContext) {
    'use strict';
    var entityName = formContext._entityName;
    var gridName = gridContext.getGrid().controlName;

    if (entityName === "pub_bdplan" || entityName === "pub_bdinitiative" || entityName === "account" || entityName === "contact") {
        return false;
    }

    if (entityName === "pub_bdactivity") {
        return false;
    }

    return true;
}

//
//

var Nspc_BDSpendItems_Ribbon_New = function (formContext, gridContext) {
    'use strict';

    var entityName = formContext._entityName;
    var gridName = gridContext.getGrid().controlName;

    if (entityName === "pub_bdplan" || entityName === "pub_bdinitiative" || entityName === "pub_bdactivity") {
        return false;
    }

    return true;
}

var Nspc_BDSpendItems_Ribbon_Existing = function (formContext, gridContext) {
    'use strict';

    var entityName = formContext._entityName;
    var gridName = gridContext.getGrid().controlName;

    if (entityName === "pub_bdplan" || entityName === "pub_bdinitiative" || entityName === "pub_bdactivity") {
        return false;
    }

    return true;
}