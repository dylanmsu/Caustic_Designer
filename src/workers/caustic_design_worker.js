const { getPixels, savePixels } = require('ndarray-pixels')
const ndarray = require('ndarray')
const { parentPort } = require('worker_threads');

const {loadImage, runTransportIteration, runHeightIteration, getErrorGrid, initializeTransportSolver, initializeHeightSolver, getParameterizationSvg} = require('C:/Users/dylan/Documents/Caustic_Designer/caustic_engineering/build/Release/CausticEngineering.node');

let aspect_ratio = 0.0;

parentPort.on('message', async message => {
    if (message.type === 'loadImage') {
    //if (message[0] === 'loadImage') {
        const imageBuffer = Buffer.from(message.data.replace(/^data:image\/\w+;base64,/, ''), 'base64');

        const pixels = await getPixels(imageBuffer, 'image/png'); // Uint8Array -> ndarray

        let pixel_intensities_1d = [];
        const [width, height] = pixels.shape;
        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {
                let red = pixels.get(x, y, 0);
                let green = pixels.get(x, y, 1);
                let blue = pixels.get(x, y, 2);
                pixel_intensities_1d.push(((0.299 * red) + (0.587 * green) + (0.114 * blue)) / 255.0);
            }
        }

        aspect_ratio = width / height;
        
        var ret = loadImage(pixel_intensities_1d, width, height);

        //parentPort.postMessage(['ok'])
        parentPort.postMessage({type: 'imageUrl', data: message.data});
    }

    if (message.type === 'start-transport') {
        initializeTransportSolver(message.data.mesh_resolution, aspect_ratio, message.data.lens_width);

        parentPort.postMessage({type: 'svg-data', data: getParameterizationSvg()});

        for (let i=0; i<100; i++) {
            let step_size = runTransportIteration();
    
            let grid = getErrorGrid();
    
            let output = ndarray(new Float32Array((message.data.mesh_resolution*4) * (message.data.mesh_resolution*4 * aspect_ratio) * 4), [message.data.mesh_resolution*4, message.data.mesh_resolution*4*aspect_ratio, 4]);
            for (let y = 0; y < message.data.mesh_resolution*4*aspect_ratio; ++y) {
                for (let x = 0; x < message.data.mesh_resolution*4; ++x) {
                    output.set(x, y, 0, grid[y * message.data.mesh_resolution*4 + x] * 255.0)
                    output.set(x, y, 1, grid[y * message.data.mesh_resolution*4 + x] * 255.0)
                    output.set(x, y, 2, grid[y * message.data.mesh_resolution*4 + x] * 255.0)
                    output.set(x, y, 3, 255.0)
                }
            }
        
            const imageOut = await savePixels(output, 'image/png');
        
            const imageDataURL = `data:image/png;base64,${imageOut.toString('base64')}`;
        
            parentPort.postMessage({type: 'svg-data', data: getParameterizationSvg()});
            parentPort.postMessage({type: 'step-size', data: Math.round(step_size * 10000) / 10000});
            
            // convergance check
            if (step_size < 0.0005) break;
        }
        parentPort.postMessage({type: 'transport-done'})
    }

    /*if (message.type === 'startHeight') {
        initializeHeightSolver(message.data, message[2]);

        for (let i=0; i<2; i++) {
            let step_size = runHeightIteration();

            postMessage(['stepSize', Math.round(step_size * 10000) / 10000]);
        }

        postMessage(['doneHeight'])
    }*/

    if (message.type === 'get-svg-param') {
        initializeTransportSolver(100, 1, 1);
        parentPort.postMessage({type: 'SVG', data: getParameterizationSvg()});
        //parentPort.postMessage({type: 'SVG', data: 'hello'});
    }
});