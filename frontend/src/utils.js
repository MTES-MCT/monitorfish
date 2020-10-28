export let calculatePointsDistance = (coord1, coord2) => {
    let dx = coord1[0] - coord2[0];
    let dy = coord1[1] - coord2[1];

    return Math.sqrt(dx * dx + dy * dy);
};

export let calculateSplitPointCoords = (startNode, nextNode, distanceBetweenNodes, distanceToSplitPoint) => {
    let d = distanceToSplitPoint / distanceBetweenNodes;
    let x = nextNode[0] + (startNode[0] - nextNode[0]) * d;
    let y = nextNode[1] + (startNode[1] - nextNode[1]) * d;

    return [x, y];
};
