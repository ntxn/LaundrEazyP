class Utilities {
    static CardType = {
        3: "cc-amex",
        4: "cc-visa",
        5: "cc-mastercard",
        6: "cc-discover"
    }
    
    static degreesToRadians(degrees){return (degrees * Math.PI) / 180;}
  
  /**
   * Calculates the distance, in kilometers, between two locations, via the
   * Haversine formula. Note that this is approximate due to the fact that
   * the Earth's radius varies between 6356.752 km and 6378.137 km.
   * 
   * @return {number} The distance, in miles, between the inputted locations.
   */
    static distance(lat1, long1, lat2, long2){
        const radius = 6371; // Earth's radius in kilometers
        const latDelta = this.degreesToRadians(Math.abs(lat1 - lat2));
        const lonDelta = this.degreesToRadians(Math.abs(long1 - long2));
  
        const a = (Math.sin(latDelta / 2) * Math.sin(latDelta / 2)) +
            (Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
            Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2));
  
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const km = radius * c;
        return km * 0.6214;
    }

    static formatStandardTime = date => {
        var hour = date.getHours();
        const ampm = hour > 11 ? "PM" : "AM";
        hour = hour > 12 ? hour % 12 : hour;
        var minute = date.getMinutes();
        minute = minute < 10 ? "0" + minute.toString() : minute.toString();
        return hour.toString() + ":" + minute + " " + ampm;
    }

    static sortReservations = reservations => reservations.sort((a, b) => {return a.startTime - b.startTime})
}

export default Utilities;