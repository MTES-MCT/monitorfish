import {Icon, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";

export const setShipIconStyle = (ship, iconFeature, shipTrackInternalReferenceNumberToShow) => {
    const shipDate = new Date(ship.dateTime);
    const nowMinusTwoHours = new Date();
    nowMinusTwoHours.setHours(nowMinusTwoHours.getHours() - 3);

    const iconStyle = new Style({
        image: new Icon({
            src: 'boat_mf.png',
            offset: [0, 0],
            imgSize: [14, 14],
            rotation: ship.course,
            opacity: shipDate < nowMinusTwoHours ? 0.5 : 1
        }),
    });

   if (ship.internalReferenceNumber === shipTrackInternalReferenceNumberToShow) {
       iconFeature.setStyle([iconStyle, selectedShipStyle]);
   } else {
       iconFeature.setStyle(iconStyle);
   }
}

export const selectedShipStyle =  new Style({
    image: new Icon({
        opacity: 1,
        src: 'select.png',
        scale: 0.4
    })
})

export const setCircleStyle = (color, arrowFeature) => {
    const arrowStyle = new Style({
        image: new CircleStyle({
            radius: 3,
            fill: new Fill({
                color: color
            })
        })
    });
    arrowFeature.setStyle(arrowStyle);
}

export const setArrowStyle = (trackArrow, arrowFeature) => {
    const arrowStyle = new Style({
        image: new Icon({
            src: trackArrow,
            offset: [0, 0],
            imgSize: [20, 34],
            scale: 0.6,
            rotation: arrowFeature.getProperties().course
        }),
    });

    arrowFeature.setStyle((feature, resolution) => {
        arrowStyle.getImage().setScale(1 / Math.pow(resolution, 1/6));
        return arrowStyle;
    });
}