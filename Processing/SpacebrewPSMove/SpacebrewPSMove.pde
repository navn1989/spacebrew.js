import spacebrew.*;
import io.thp.psmove.*;

String server="193.10.67.60";
String name="PSMove";
String description ="Client that sends data of PSMove";

Spacebrew sb;
PSMove move;
String moveData;
JSONObject moveJSON;
int[] moveColor = {0, 0, 0};
float [] ax = {0.f}, ay = {0.f}, az = {0.f};
float [] gx = {0.f}, gy = {0.f}, gz = {0.f};
float [] mx = {0.f}, my = {0.f}, mz = {0.f};

void setup() {
  size(400, 200);
  background(0);
  
  // PSMove
  move = new PSMove();
  moveJSON = new JSONObject();
  updateMoveJSON();

  // SpaceBrew definition
  sb = new Spacebrew( this );
  sb.addPublish( "move data", "move", moveJSON+"");
  sb.addPublish( "accelerometer X", "range", ax[0]+""); 
  sb.addPublish( "accelerometer Y", "range", ay[0]+""); 
  sb.addPublish( "accelerometer Z", "range", az[0]+""); 
  
  sb.addSubscribe( "set move color", "color" );
  sb.addSubscribe("Red", "range");
  sb.addSubscribe("Green", "range");
  sb.addSubscribe("Blue", "range");
  sb.connect(server, name, description ); 
  
  
}

void draw() {
  updateMove();
}

void updateMove() {
  while (move.poll() != 0) {
    move.set_leds(moveColor[0], moveColor[1], moveColor[2]);
    move.update_leds();
  }   
  
  sendMoveData();
  
}

// MESSAGE OUTPUT PROCESSING

void sendMoveData() {
 // Sensor data
 move.get_accelerometer_frame(io.thp.psmove.Frame.Frame_SecondHalf, ax, ay, az);
 move.get_gyroscope_frame(io.thp.psmove.Frame.Frame_SecondHalf, gx, gy, gz);
 move.get_magnetometer_vector(mx, my, mz);
 
 updateMoveJSON();
 
 sb.send( "move data", "move", moveJSON + ""); 
 
 
 // Accelerometer
  sb.send( "accelerometer X", "range", gx[0]+""); 
  sb.send( "accelerometer Y", "range", gy[0]+""); 
  sb.send( "accelerometer Z", "range", gz[0]+""); 
 
}

void updateMoveJSON() {
 /*JSONObject magnetometer = new JSONObject();
 
  magnetometer.setFloat("x", mx[0]);
  magnetometer.setFloat("y", my[0]);
  magnetometer.setFloat("z", mz[0]);
  moveJSON.setJSONObject("magnetometer", magnetometer);*/
  
  JSONObject gyroscope = new JSONObject();
  gyroscope.setFloat("x", gx[0]);
  gyroscope.setFloat("y", gy[0]);
  gyroscope.setFloat("z", gz[0]);
  moveJSON.setJSONObject("gyroscope", gyroscope);
  
  JSONObject accelerometer = new JSONObject();
  accelerometer.setFloat("x", ax[0]);
  accelerometer.setFloat("y", ay[0]);
  accelerometer.setFloat("z", az[0]);
  moveJSON.setJSONObject("accelerometer", accelerometer);
  
  JSONObject colorData = new JSONObject();
  colorData.setFloat("r", moveColor[0]);
  colorData.setFloat("g", moveColor[1]);
  colorData.setFloat("b", moveColor[2]);
  moveJSON.setJSONObject("color", colorData); 
}

// MESSAGE INPUT PROCESSING
void onCustomMessage( String name, String type, String value ){
  if (type.equals("color")) {
    JSONObject moveJSON = JSONObject.parse(value); 
    
    moveColor[0] = moveJSON.getInt("r");
    moveColor[1] = moveJSON.getInt("g");
    moveColor[2] = moveJSON.getInt("b");
  }
}

void onRangeMessage( String name, int value ) {
  if (name.equals("Red")) {
    moveColor[0] = value;
  } else if (name.equals("Green")) {
    moveColor[1] = value;
  } else if (name.equals("Blue")) {
    moveColor[2] = value;
  }
}

