const driverModal = require("../models/driver");
const adminModel = require("../models/admin");
const jwt = require("jsonwebtoken");
const { getVehicleName } = require("../services/vehicle");

const validateAdminDriverAuth = async(req,res,next) =>{
    if (!req.headers.authorization) {
        return res.status(401).json({
            status: 401,
            message: "Token not found",
        });
    }
    const token = req.headers.authorization.split(" ")[1] || req.params.token;
    let isValidToken = true;
    if (!token) {
        isValidToken = false;
        return res.status(401).json({
            status: 401,
            message: "Token not found",
        });
    }
    try{
        const decrypt = jwt.verify(token, process.env.SECRET,{complete:true});
        if(decrypt.payload && decrypt.payload.phoneNumber){
            let driverDetails = await driverModal.findOne({
                phoneNumber: decrypt.payload.phoneNumber
            });
            if(!driverDetails){
                isValidToken = false;
                return res.status(401).json({
                    status: 401,
                    error: "No user found."
                });
            }
            if(driverDetails && !driverDetails.accountStatus){
                isValidToken = false;
                return res.status(401).json({
                    status: 401,
                    error: "Account Deactivated."
                });
            }
            if (isValidToken) {
                const vehicleName = await getVehicleName(driverDetails.vehicleId);
                driverDetails.expiresIn = decrypt.exp*1000
                req.driver = { ...driverDetails._doc, vehicleType: vehicleName };
                next();
            }
        }
        else if(decrypt.payload && decrypt.payload.username){
            let adminDetails = await adminModel.findOne({
                username: decrypt.payload.username
            });
            if(!adminDetails){
                isValidToken = false;
                return res.status(401).json({
                    status: 401,
                    error: "No user found."
                });
            }
            if (isValidToken) {
                req.admin = adminDetails;
                next();
            }
        }
        else{
            isValidToken = false;
            return res.status(401).json({
                status: 401,
                error: "No user found."
            });
        }
    }
    catch(error){
        console.log(error)
        res.status(400).json({
            error: error
        })
    }

}
module.exports={
    validateAdminDriverAuth
}