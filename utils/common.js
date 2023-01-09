const moment = require("moment-timezone");
const { redisClient, pub } = require("../redis");
require("dotenv").config();

const drivers = [];
function driverJoin(id, vehicleId, location) {
  const driver = { id, vehicleId, location };
  drivers.push(driver);
  pub.publish("driverDataUpdate", JSON.stringify(drivers));
  return driver;
}
function getAllDrivers() {
  return drivers;
}
function getCurrentDriver(id) {
  return drivers.find((user) => user.id === id);
}
function updateDriver(id, vehicleId, location) {
  let index = drivers.findIndex((driver) => driver.id === id);

  if (index !== -1) {
    drivers.splice(index, 1)[0];
  }
  let updateddriver = { id, vehicleId, location };
  drivers.push(updateddriver);
  pub.publish("driverDataUpdate", JSON.stringify(drivers));
  return updateddriver;
}
function getRoomUsers(vehicleId) {
  return drivers.filter((driver) => driver.vehicleId === vehicleId);
}
function driverLeave(id) {
  const index = drivers.findIndex((user) => user.id === id);

  if (index !== -1) {
    const data = drivers.splice(index, 1)[0];
    pub.publish("driverDataUpdate", JSON.stringify(drivers));
    return data;
  }
}
const currentDate = () => {
  return moment.tz(moment(), "Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
};
const setOrderRedis = async (orderData) => {
  await redisClient.hSet(
    "order",
    orderData._id.toString(),
    JSON.stringify(orderData)
  );
};
const deleteOrderRedis = async (orderId) => {
  await redisClient.hDel("order", orderId.toString());
};

const getInvoiceHTML = (
  orderDetails,
  invoiceNumber,
  userDetails,
  goodDetails,
  driverDetails,
  vehicleName,
  deliveredDate
) => {
  let mapImage = `https://maps.googleapis.com/maps/api/staticmap?center=${orderDetails?.source?.latitude}%2c%20${orderDetails?.source?.longitude}&zoom=12&size=350x250`;
  if (orderDetails?.source?.latitude) {
    mapImage += `&markers=color:blue%7Clabel:S%7C${orderDetails?.source?.latitude},${orderDetails?.source?.longitude}`;
  }
  if (orderDetails?.stop1?.latitude) {
    mapImage += `&markers=color:red%7Clabel:1%7C${orderDetails?.stop1?.latitude},${orderDetails?.stop1?.longitude}`;
  }
  if (orderDetails?.stop2?.latitude) {
    mapImage += `&markers=color:red%7Clabel:2%7C${orderDetails?.stop2?.latitude},${orderDetails?.stop2?.longitude}`;
  }
  if (orderDetails?.destination?.latitude) {
    mapImage += `&markers=color:green%7Clabel:D%7C${orderDetails?.destination?.latitude},${orderDetails?.destination?.longitude}`;
  }
  mapImage += `&key=${process.env.GOOGLE_MAP_API_KEY}`;
  let html = `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TransKart</title>
    <style>
 .container {
        width: 100%;
        padding-top: 30px;
        padding-bottom: 30px;
      }
      .headertitle {
        font-size: 16;
        width: 100%;
        text-align: center;
      }
      .headerContainer {
        width: 95%;
        margin-left: 2.5%;
        padding-top: 20px;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: justify;
            -ms-flex-pack: justify;
                justify-content: space-between;
      }
      .headerContainer2 {
        width: 95%;
        margin-left: 2.5%;
        padding-top: 20px;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
            -ms-flex-direction: column;
                flex-direction: column;
      }
      .headerContainer1 {
        width: 95%;
        height: 700px;
        margin-left: 2.5%;
        padding-top: 20px;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: justify;
            -ms-flex-pack: justify;
                justify-content: space-between;
      }
      .transkart {
        color: darkcyan;
        font-size: 36px;
      }
      .DeliveryMessage {
        padding-top: 5px;
        font-size: 18px;
      }
      .headercenter {
        width: 100px;
        height: 22px;
        padding: 10px;
        border: 1px;
        border-radius: 25px;
        background-color: #d1daf2;
      }
      .driverbox {
        width: 200px;
        height: 20px;
        padding: 10px;
        border: 1px;
        border-radius: 25px;
        background-color: #eef2ff;
      }
      .tripStatus {
        color: #c67b93;
      }
      .driverStatus {
        color: #2c64ff;
      }
      .Invoicetitle {
        font-size: 16px;
        font-weight: 600;
      }
      .InvoiceNumber {
        font-size: 16px;
        font-weight: 400;
      }
      .Invoicecontainer {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: end;
            -ms-flex-pack: end;
                justify-content: flex-end;
        padding-top: 5px;
      }
      .containerLeft {
        width: 48%;
      }
      .containerRight {
        width: 45%;
        padding: 30px;
        background-color: #f9f9f9;
        border-radius: 20px;
      }
      .userContainer {
        height: 100px;
        margin-bottom: 20px;
        padding: 30px;
        background-color: #f9f9f9;
        border-radius: 20px;
      }
      .userContainer1 {
        height: 30px;
        margin-bottom: 20px;
        padding: 30px;
        background-color: #f9f9f9;
        border-radius: 20px;
      }
      .boxcontainer {
        width: 45%;
        height: 100px;
        padding: 30px;

        border-radius: 20px;
      }
      .image {
        width: 100%;
        height: 350px;
        -o-object-fit: cover;
           object-fit: cover;
      }
      .driverName{
        font-size: larger;
        display: flex;
        align-items: center;
      }
      .driverBox{
        width: 75px;
        display:inline-block
        }
      .driverImage{
        width: 60px;
        height: 60px;
        border-radius: 50%;
        margin-right:5px
      }
      .billContainer {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: justify;
            -ms-flex-pack: justify;
                justify-content: space-between;
      }
      .billAmount {
        font-size: 20px;
        color: black;
        font-weight: 800;
        margin-top: 20px;
      }
      .totalAmount {
        font-size: 16px;
        color: black;
        font-weight: 600;
        margin-top: 20px;
      }
      .Amount {
        font-size: 16px;
        color: black;
        font-weight: 400;
        margin-top: 20px;
      }
      .solid {
        border: 0.5px solid black;
        margin-top: 15px;
        margin-bottom: 15px;
      }
      .name {
        font-size: 16px;
        color: grey;
        font-weight: 400;
        margin-bottom: 10px;
      }
      .value {
        font-size: 16px;
        color: black;
        font-weight: 600;
        margin-bottom: 10px;
      }
      .date {
        font-size: 16px;
        color: black;
        font-weight: 600;
        margin-bottom: 5px;
        margin-top: 5px;
      }
      .location {
        font-size: 16px;
        color: grey;
        font-weight: 400;
        margin-bottom: 5px;
      }
      .footter {
        height: 30px;
      }
      .drivercontainer {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: justify;
            -ms-flex-pack: justify;
                justify-content: space-between;
        -webkit-box-align: center;
            -ms-flex-align: center;
                align-items: center;
      }
      .container1 {
        margin-top: 50px;
        width: 70%;
      }
      .step {
        padding: 10px;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: horizontal;
        -webkit-box-direction: normal;
            -ms-flex-direction: row;
                flex-direction: row;
        -webkit-box-pack: start;
            -ms-flex-pack: start;
                justify-content: flex-start;
        background-color: cream;
      }
      .v-stepper {
        position: relative;
        /*   visibility: visible; */
      }
      /* regular step */
      .step .circle {
        background-color: white;
        border: 3px solid gray;
        border-radius: 100%;
        width: 20px; /* +6 for border */
        height: 20px;
        display: inline-block;
      }
      .step .line {
        top: 23px;
        left: 12px;
        /*   height: 120px; */
        height: 100%;
        position: absolute;
        border-left: 3px dotted gray;
      }
      .step.completed .circle {
        visibility: visible;
        background-color: green;
        border-color: green;
      }
      .step.cancelled .circle {
        visibility: visible;
        background-color: red;
        border-color: red;
      }
      .step.active .circle {
        visibility: visible;
        border-color: red;
      }
      .step.empty .circle {
        visibility: hidden;
      }
      .step.empty .line {
        top: 0;
        height: 150%;
      }
      .step:last-child .line {
        border-left: 3px solid white;
        z-index: -1; /* behind the circle to completely hide */
      }
      .content {
        margin-left: 20px;
        display: inline-block;
      }
      .declaration {
        font-size: 16px;
        color: grey;
        font-weight: 600;
        margin-bottom: 5px;
      }
      .transKart{
        width: 300px;
        height: 120px;
      }
      .transkartImage{
        width: 100%;
      }
      .driverDetails{
        margin-bottom:5px
        padding-bottom:10px
      }
      .map{
        margin-left:50px
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="headertitle">Invoice/ onCisngenm nome</div>
      <div class="headerContainer">
        <div class="headerLeft">
        <div class="transKart">
        <img src="https://porter-backend.s3.ap-south-1.amazonaws.com/logo/Transkart+name.png" alt="" class="transkartImage">
      </div>
          <div class="DeliveryMessage">
            Delivery hai?Transkart se Ho Jayega!
          </div>
        </div>
        <div class="headercenter">
          <div class="tripStatus">${
            orderDetails?.orderStatus === "INITIATED"
              ? "Trip Initiated"
              : orderDetails?.orderStatus === "REJECTED"
              ? "Trip Rejected"
              : orderDetails?.orderStatus === "CANCELLED"
              ? "Trip Cancelled"
              : orderDetails?.orderStatus === "ACCEPTED"
              ? "Trip Accepted"
              : orderDetails?.orderStatus === "DELIVERED"
              ? "Trip Completed"
              : orderDetails?.orderStatus === "REFUNDED"
              ? "Trip Refunded"
              : "Trip Initiated"
          }</div>
        </div>
        <div class="headerRight">
          <div class="Invoicecontainer">
            <div class="Invoicetitle">Invoice Number :</div>
            <div class="InvoiceNumber">${invoiceNumber}</div>
          </div>
          <div class="Invoicecontainer">
            <div class="Invoicetitle">Date :</div>
            <div class="InvoiceNumber">${new Date()
              .toDateString()
              .split(" ")
              .slice(1)
              .join(" ")}</div>
          </div>
        </div>
      </div>
      <div class="headerContainer">
        <div class="containerLeft">
          <img
            class="image"
            src="https://www.simplilearn.com/ice9/free_resources_article_thumb/what_is_image_Processing.jpg"
          />
        </div>`;
  if (orderDetails.orderStatus == "CANCELLED") {
    html += `<div class="containerRight">
        <div class="billContainer">
          <div class="billAmount">Cancellation charge</div>
          <div class="billAmount">₹0</div>
        </div>
        <hr class="solid" />

        <div class="billContainer">
          <div class="Amount">Cancellation charge</div>
          <div class="Amount">₹0</div>
        </div>
        <hr class="solid" />

        <div class="billContainer">
          <div class="totalAmount">Sub Total</div>
          <div class="totalAmount">₹0</div>
        </div>
      </div>
    </div>`;
  } else {
    html += `<div class="containerRight">
        <div class="billContainer">
          <div class="billAmount">Total Amount</div>
          <div class="billAmount">₹ ${orderDetails?.totalAmount}</div>
        </div>
        <hr class="solid" />

        <div class="billContainer">
          <div class="totalAmount">Base Amount</div>
          <div class="totalAmount">₹ ${orderDetails.baseAmount}</div>
        </div>
        
        <div class="billContainer">
            <div class="Amount">SGST</div>
            <div class="Amount">₹ ${orderDetails.sgstAmount}</div>
          </div>
          <div class="billContainer">
            <div class="Amount">CGST</div>
            <div class="Amount">₹ ${orderDetails.cgstAmount}</div>
          </div>
          <hr class="solid" />

      <div class="billContainer">
        <div class="totalAmount">Net Fare</div>
        <div class="totalAmount">₹ ${orderDetails.totalAmount}</div>
      </div>
    </div>
    </div>
    `;
  }
  html += `<div class="headerContainer1">
        <div class="boxcontainer">
          <div class="userContainer">
            <div class="billContainer">
              <div class="name">CONSIGNOR NAME :</div>
              <div class="value">${
                userDetails.firstName + " " + userDetails.lastName
              }</div>
            </div>
            <div class="billContainer">
              <div class="name">COMPANY NAME :</div>
              <div class="value">Transkart</div>
            </div>
            <div class="billContainer">
              <div class="name">GSTIN :</div>
              <div class="value">NOT AVAILABLE</div>
            </div>
            <div class="billContainer">
              <div class="name">GSTIN ADDRESS :</div>
              <div class="value">NOT AVAILABLE</div>
            </div>
          </div>
          <!-- =============================================================================================== -->

          <div class="userContainer1">
            <div class="billContainer">
              <div class="name">CONSIGNEE NAME :</div>
              <div class="value">${
                orderDetails.destination.name
                  ? orderDetails.destination.name
                  : ""
              }</div>
            </div>
          </div>
          <!-- =============================================================================================== -->
          <div class="userContainer1">
            <div class="billContainer">
              <div class="name">NATURE OF GOODS :</div>
              <div class="value">
                ${goodDetails?.name || ""}
              </div>
            </div>
          </div>
          <div class="footter"></div>
        </div>

        <!-- ================================================================================================================================================================================================================================================================================== -->
        <div class="boxcontainer">`;

  if (driverDetails?.driverName && orderDetails.orderStatus !== "CANCELLED") {
    html += `<div class="drivercontainer">
    <div class="driverbox">
      <div class="driverStatus">${vehicleName} | ${driverDetails?.vehicleNumber}</div>
    </div>
    <div class="driverName">
  <img src="${driverDetails.profileImage}" alt="" class="driverImage">
    <span class="driverDetails">
    ${driverDetails?.driverName}
    </span>
    </div>
  </div>`;
  }
  if (orderDetails.orderStatus == "CANCELLED") {
    html += `<div class="container1">
  <!-- completed -->
  <div class="step completed">
    <div class="v-stepper">
      <div class="circle"></div>
      <div class="line"></div>
    </div>
    <div class="content">
      <div class="location">Pickup Location</div>
      <div>${orderDetails?.source?.address || ""}</div>
    </div>
  </div>
  ${
    orderDetails?.stop1
      ? ` <div class="step active">
  <div class="v-stepper">
    <div class="circle"></div>
    <div class="line"></div>
  </div>
  <div class="content">
    <div class="location">Stop 1 Location</div>
    <div>${orderDetails?.stop1?.address || ""}</div>
  </div>
</div>`
      : ""
  }
${
  orderDetails?.stop1
    ? ` <div class="step active">
  <div class="v-stepper">
    <div class="circle"></div>
    <div class="line"></div>
  </div>
  <div class="content">
    <div class="location">Stop 2 Location</div>
    <div>${orderDetails?.stop2?.address || ""}</div>
  </div>
</div>`
    : ""
}
  <!-- active -->
  <div class="step active">
    <div class="v-stepper">
      <div class="circle"></div>
      <div class="line"></div>
    </div>
    <div class="content">
      <div class="location">Drop Location</div>
      <div class="date">${orderDetails?.deliveredAt || ""}</div>
      <div>${orderDetails?.destination?.address || ""}</div>
    </div>
  </div>
</div>`;
  } else {
    html += `<div class="container1">
    <!-- completed -->
    <div class="step completed">
      <div class="v-stepper">
        <div class="circle"></div>
        <div class="line"></div>
      </div>
      <div class="content">
        <div class="location">Pickup Location</div>
        <div class="date">${orderDetails?.pickupTime || ""}</div>
        <div>${orderDetails?.source?.address || ""}</div>
      </div>
    </div>
    ${
      orderDetails?.stop1
        ? ` <div class="step active">
      <div class="v-stepper">
        <div class="circle"></div>
        <div class="line"></div>
      </div>
      <div class="content">
        <div class="location">Pickup Location</div>
        <div class="date">${orderDetails?.stop1?.deliveredAt || ""}</div>
        <div>${orderDetails?.stop1?.address || ""}</div>
      </div>
    </div>`
        : ""
    }
    ${
      orderDetails?.stop2
        ? ` <div class="step active">
      <div class="v-stepper">
        <div class="circle"></div>
        <div class="line"></div>
      </div>
      <div class="content">
        <div class="location">Pickup Location</div>
        <div class="date">${orderDetails?.stop2?.deliveredAt || ""}</div>
        <div>${orderDetails?.stop2?.address || ""}</div>
      </div>
    </div>`
        : ""
    }
    <!-- active -->
    <div class="step active">
      <div class="v-stepper">
        <div class="circle"></div>
        <div class="line"></div>
      </div>
      <div class="content">
        <div class="location">Drop Location</div>
        <div class="date">${deliveredDate ? deliveredDate || "" : ""}</div>
        <div>${orderDetails?.destination?.address || ""}</div>
      </div>
    </div>
  </div>`;
  }

  html += `
  <div class="map">
      <img src="${mapImage}"/>
  </div>
  <div class="footter"></div>
        </div>
      </div>
      <div class="headerContainer2">
        <div class="declaration">DECLARATION</div>
        <div class="location">
          1. I/We hereby declare that through our aggregate turnover in any
          preceding financial year from 2017-18 onwardis more than the aggregate
          turnover notified under sub-rule(4) of rule-48,we are not required to
          prepare an invoice in terms of the provisions of the said sub-rule
        </div>
      </div>
    </div>
  </body>
</html>`;
  return html;
};
module.exports = {
  currentDate,
  driverJoin,
  getAllDrivers,
  getCurrentDriver,
  updateDriver,
  driverLeave,
  setOrderRedis,
  deleteOrderRedis,
  getInvoiceHTML,
  getRoomUsers,
};
