var webrtc = new SimpleWebRTC({
    localVideoEl: '',
    remoteVideosEl: '',
    autoRequestMedia: false,
    receiveMedia: {
      mandatory: {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
      }
    }
  });

  webrtc.joinRoom(window.currentUser.id);

  webrtc.on('createdPeer', function (peer) {
    console.log('onCreatedPeer');

    if (peer && peer.pc) {
      peer.pc.on('iceConnectionStateChange', function (event) {
        console.log('iceConnectionStateChange', event);
        var state = peer.pc.iceConnectionState;
        switch (state) {
          case 'checking':
            console.log('Connecting to peer...');
            break;
          case 'connected':
          case 'completed':
            console.log('connection established');
            break;
          case 'disconnected':
            console.log('connection disconnected');
            break;
          case 'failed':
            console.log('connection failed');
            break;
          case 'closed':
            console.log('connection closed');
            break;
        }
      });
    }

    if (window.currentUser.isReceiver === 'true') {
      var status = document.getElementById('status'),
          progressBar = $('.progress-bar');
      peer.on('fileTransfer', function (metadata, receiver) {
        $('#statusBar').show();
        status.innerHTML = 'incoming filetransfer ' + metadata.name + ' ' + (metadata.size/1000).toFixed(1) + 'KB';
        receiver.on('progress', function (bytesReceived) {
          progressBar.attr('aria-valuenow', (bytesReceived*100/metadata.size).toFixed(0));
          progressBar.css({ width: (bytesReceived*100/metadata.size).toFixed(1) + '%' });
          progressBar.html((bytesReceived*100/metadata.size).toFixed(1) + '%');
        });
        receiver.on('receivedFile', function (file, metadata) {
          status.innerHTML = 'received file ' + metadata.name + ' ' + (metadata.size/1024).toFixed(1) + ' KB';
          var href = document.createElement('a');
          href.href = URL.createObjectURL(file);
          href.download = metadata.name;
          href.appendChild(document.createTextNode('Click to save ' + metadata.name));
          document.getElementById('files').appendChild(href);
          receiver.channel.close();
        });
      });
    } else if (window.currentUser.isReceiver === 'false') {
      var container = $('#container'),
        progressBar = $('.progress-bar'),
        sender = {},
        file = {},
        status = document.getElementById('status');
      status.innerHTML = 'incoming connection established';
      container.show();
      container.on('dragenter', skip);
      container.on('dragover', skip);
      container.on('drop', function(e){
        e.originalEvent.preventDefault();
        $('#senderPanel').hide();
        $('#statusBar').show();
        file = e.originalEvent.dataTransfer.files[0];
        sender = peer.sendFile(file);
        status.innerHTML = 'You sending ' + file.name + ' ' + (file.size/1024).toFixed(0) + ' KB';
        sender.on('progress', function (bytesSent) {
          setTimeout(function(){
            progressBar.attr('aria-valuenow', (bytesSent*100/file.size).toFixed(1));
            progressBar.css({ width: (bytesSent*100/file.size).toFixed(1) + '%' });
            progressBar.html((bytesSent*100/file.size).toFixed(1) + '%');
          }, 10);

        });
        sender.on('sentFile', function () {
          status.innerHTML = 'You sent ' + file.name + ' ' + (file.size/1024).toFixed(1) + ' KB successfuly.';
        });
        sender.on('complete', function () {
          sender.channel.close();
        });
      });

      function skip(e){
        e.preventDefault();
        e.stopPropagation();
      }
    }
  });