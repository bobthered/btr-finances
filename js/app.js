// Initialize Firebase
var config = {
  apiKey: "AIzaSyDt-Yh7w4McmLlE7O2Vt3tgLuEl8DEaZBA",
  authDomain: "btr-finances.firebaseapp.com",
  databaseURL: "https://btr-finances.firebaseio.com",
  projectId: "btr-finances",
  storageBucket: "btr-finances.appspot.com",
  messagingSenderId: "509032023079"
};
firebase.initializeApp(config);

window.addEventListener( 'load', e => {
  btrPWA.fb.state.auth.fetchURLs = ['sections/list.html', 'sections/settings.html', 'sections/transactions.html', 'sections/welcome.html'];
  btrPWA.fb.state.auth.settingsSet = function() {
    btrPWA.fb.dbRef.user = {};
    btrPWA.fb.dbRef.user.appearance  = btrPWA.fb.db.ref( 'settings/' + btrPWA.fb.user.uid + '/appearance/' );
    btrPWA.fb.dbRef.user.profile     = btrPWA.fb.db.ref( 'settings/' + btrPWA.fb.user.uid + '/profile/' );
    btrPWA.fb.dbRef.user.showToolbar = btrPWA.fb.db.ref( 'settings/' + btrPWA.fb.user.uid + '/showToolbar/' );
    btrPWA.fb.dbRef.user.startScreen = btrPWA.fb.db.ref( 'settings/' + btrPWA.fb.user.uid + '/startScreen/' );

    btrPWA.fb.dbRef.user.transactions = btrPWA.fb.db.ref( 'transactions/' + btrPWA.fb.user.uid );

    btrPWA.fb.dbRef.user.appearance.on( 'value', snapshot => {
      if ( snapshot.val() !== null ) {
        const appearance = snapshot.val();
        document.querySelector( 'body' ).setAttribute( 'appColor', appearance.appColor );
        document.querySelector( 'body' ).setAttribute( 'darkMode', appearance.darkMode );

        document.querySelectorAll( 'input[name="appColor"]' ).forEach( appColor => {
          if ( appearance.appColor === appColor.value ) {
            appColor.checked = true;
          } else {
            appColor.checked = false;
          }
        } );
        document.querySelector( '.darkMode' ).checked = appearance.darkMode;
      }
    } );

    btrPWA.fb.dbRef.user.profile.on( 'value', snapshot => {
      if ( snapshot.val() !== null ) {
        const profile = snapshot.val();
        document.querySelector( '.form--settings--profile .firstName' ).value = profile.firstName;
        document.querySelector( '.form--settings--profile .lastName' ).value  = profile.lastName;
      }
    } );

    btrPWA.fb.dbRef.user.showToolbar.on( 'value', snapshot => {
      if ( snapshot.val() !== null ) {
        if ( snapshot.val() ) {
          btrPWA.toolbar.show();
          btrPWA.listeners.update();
        } else {
          btrPWA.toolbar.hide();
        }
      }
    } );

    btrPWA.fb.dbRef.user.startScreen
    .once( 'value' )
    .then( snapshot => {
      if ( snapshot.val() !== null ) {
        document.querySelectorAll( 'input[name="startScreen"]' ).forEach( startScreen => {
          if ( snapshot.val() === startScreen.value ) {
            startScreen.checked = true;
          } else {
            startScreen.checked = false;
          }
        } );
        btrPWA.section.show( snapshot.val() );
        btrPWA.spinner.hide();
      }
    } );

    btrPWA.fb.dbRef.user.transactions.on( 'child_added', data => {
      const transaction    = data.val();
      const key            = data.key;
      const navigationList = document.querySelector( '.navigationList--transactions' );
      const navigationItem = btrPWA.createNode( 'navigationItem' );
      const button         = btrPWA.createNode( 'button' );
      const iconDelete     = btrPWA.createNode( 'i' );
      const title          = btrPWA.createNode( 'title' );
      const iconRightArrow = btrPWA.createNode( 'i' );

      navigationItem.setAttribute( 'key', key );
      button.setAttribute( 'class', 'icon delete' );
      iconDelete.setAttribute( 'class', 'fas fa-times' );
      title.innerHTML = transaction.description;
      iconRightArrow.setAttribute( 'class', 'fas fa-angle-right' );

      btrPWA.append( button, iconDelete );
      btrPWA.append( navigationItem, button );
      btrPWA.append( navigationItem, title );
      btrPWA.append( navigationItem, iconRightArrow );
      btrPWA.append( navigationList, navigationItem );

      btrPWA.listeners.update();
    } );

    btrPWA.fb.dbRef.user.transactions.on( 'child_changed', data => {
      const transaction = data.val();
      document.querySelector( '.navigationList--transactions navigationItem[key="' + data.key + '"] title' ).innerHTML = transaction.description;
      btrPWA.list.reset();
    } );

    btrPWA.fb.dbRef.user.transactions.on( 'child_removed', data => {
      document.querySelector( '.navigationList--transactions navigationItem[key="' + data.key + '"]' ).remove();
    } );

    btrPWA.list.reset();

    btrPWA.listeners.update();
  };
  btrPWA.fb.state.auth.success = function() {
    btrPWA.fb.db.ref( 'settings/' + btrPWA.fb.user.uid )
    .once( 'value' )
    .then( snapshot => {
      if( !snapshot.val() ) {
        btrPWA.fb.db.ref( 'settings/' + btrPWA.fb.user.uid  )
        .set( {
          'appearance' : {
            'appColor' : 'color--0',
            'darkMode' : true
          },
          'profile'    : {
            'firstName' : '',
            'lastName'  : ''
          },
          'showToolbar' : false,
          'startScreen' : 'welcome'
        } )
        .then( () => {
          btrPWA.fb.state.auth.settingsSet();
        } );
      } else {
        btrPWA.fb.state.auth.settingsSet();
      }
    } );
  };
  btrPWA.toolbar.toolbars = [
    { sectionContainer : 'list', i : 'fas fa-bars' },
    { sectionContainer : 'transactions', i : 'fas fa-pen' },
    { sectionContainer : 'settings', i : 'fas fa-cog' },
    { class : 'fbSignOut', i : 'fas fa-sign-out-alt' }
  ];
  btrPWA.buttonGetStarted = {
    listeners : function() {
      btrPWA.ael( 'click', document.querySelector( '.getStarted' ), e => {
        e.preventDefault();
        btrPWA.fb.dbRef.user.showToolbar.set( true );
        btrPWA.fb.dbRef.user.startScreen.set( 'settings' );
        btrPWA.section.show( 'settings' );
      } );
    }
  };
  btrPWA.buttonMoreTransactions = {
    listeners : function() {
      btrPWA.ael( 'click', document.querySelector( '.moreTransactions' ), e => {
        e.preventDefault();
        const table = document.querySelector( '.table--list' )
        const dateStart = parseInt( table.getAttribute( 'dateStart' ) );
        const dateEnd   = parseInt( table.getAttribute( 'dateEnd' ) );
        table.setAttribute( 'dateStart', dateStart + ( 60 * 60 * 24 * 30 ) );
        table.setAttribute( 'dateEnd', dateStart + ( 60 * 60 * 24 * 30 ) );
        btrPWA.list.append();
      } );
    }
  };
  btrPWA.fb.signout = function( e = null ) {
    if ( e ) { e.preventDefault(); }
    btrPWA.modal.confirm ( {
      'message' : 'Are you sure you want to sign out?',
      'confirm' : function() {
        btrPWA.spinner.show();
        btrPWA.fb.auth.signOut()
          .then( () => {
            btrPWA.modal.hideAll();
            document.querySelector( 'body' ).setAttribute( 'appColor', '' );
            document.querySelector( 'body' ).setAttribute( 'darkMode', 'true' );
            btrPWA.toolbar.hide();
          } );
      }
    } );
  };
  btrPWA.formChangeEmail = {
    listeners : function() {
      btrPWA.ael( 'submit', document.querySelector( '.form--settings--credentials--changeEmail'), e => {
        e.preventDefault();
        btrPWA.spinner.show();

        const email = e.target.querySelector( '.email' ).value;
        const user  = btrPWA.fb.auth.currentUser;

        user.updateEmail( email )
          .then( () => {
            btrPWA.spinner.hide();
            btrPWA.modal.success( { message : 'Your email has successfully been updated to "' + email + '"' } );
          } )
          .catch( ( e ) => {
            btrPWA.spinner.hide();
            if ( e.code === 'auth/requires-recent-login' ) {
              btrPWA.modal.show( 'fbReauthenticate' );
            } else {
              btrPWA.modal.error( { message : e.message } );
            }
          } );
      } );
    }
  };
  btrPWA.formChangePassword = {
    listeners : function() {
      btrPWA.ael( 'submit', document.querySelector( '.form--settings--credentials--changePassword'), e => {
        e.preventDefault();
        btrPWA.spinner.show();

        const password = e.target.querySelector( '.password' ).value;
        const user     = btrPWA.fb.auth.currentUser;

        user.updatePassword( password )
          .then( () => {
            btrPWA.spinner.hide();
            btrPWA.modal.success( { message : 'Your password has successfully been updated!' } );
          } )
          .catch( ( e ) => {
            btrPWA.spinner.hide();
            if ( e.code === 'auth/requires-recent-login' ) {
              btrPWA.modal.show( 'fbReauthenticate' );
            } else {
              btrPWA.modal.error( { message : e.message } );
            }
          } );
      } );
    }
  };
  btrPWA.formProfile = {
    listeners : function() {
      btrPWA.ael( 'submit', document.querySelector( '.form--settings--profile' ), e => {
        e.preventDefault();
        btrPWA.spinner.show();

        const firstName = e.target.querySelector( '.firstName' ).value;
        const lastName  = e.target.querySelector( '.lastName' ).value;

        btrPWA.fb.dbRef.user.profile
          .set( { firstName, lastName } )
          .then( () => {
            btrPWA.spinner.hide();
            btrPWA.modal.success( { message : 'Your profile has successfully been updated!' } );
          } );
      } );
    }
  };
  btrPWA.formSignin = {
    listeners : function() {
      btrPWA.ael( 'submit', document.querySelector( '.form--signin' ), e => btrPWA.fb.signin( e ) );
    }
  };
  btrPWA.formSignUp = {
    listeners : function() {
      btrPWA.ael( 'submit', document.querySelector( '.form--signup' ), e => btrPWA.fb.signup( e ) );
    }
  };
  btrPWA.formTransactionsAdd = {
    listeners : function() {
      btrPWA.ael( 'submit', document.querySelector( '.form--transactions--add' ), e => {
        e.preventDefault();
        btrPWA.spinner.show();
        let transaction = {};

        e.target.querySelectorAll( 'input, select' ).forEach( input => {
          if ( input.getAttribute( 'type' ) !== 'checkbox' ) {
            transaction[input.getAttribute( 'class' )] = input.value;
          } else {
            transaction[input.getAttribute( 'class' )] = input.checked;
          }
        } );
        let newTransaction = btrPWA.fb.db.ref( 'transactions/' + btrPWA.fb.user.uid ).push();
        newTransaction
          .set( transaction )
          .then( () => {
            btrPWA.spinner.hide();
            btrPWA.modal.success( { 'message' : 'Transaction successfully added!' } );
            btrPWA.list.update();
          } );
      } );
    }
  };
  btrPWA.formTransactionEdit = {
    listeners : function() {
      btrPWA.ael( 'submit', document.querySelector( '.form--transactions--edit' ), e => {
        e.preventDefault();
        btrPWA.spinner.show();
        let transaction = {};
        let key = e.target.querySelector( '.key' ).value;

        e.target.querySelectorAll( 'input, select' ).forEach( input => {
          if ( input.getAttribute( 'type' ) !== 'checkbox' ) {
            transaction[input.getAttribute( 'class' )] = input.value;
          } else {
            transaction[input.getAttribute( 'class' )] = input.checked;
          }
        } );

        delete transaction.key;

        btrPWA.fb.db.ref( 'transactions/' + btrPWA.fb.user.uid + '/' + key )
          .set( transaction )
          .then( () => {
            btrPWA.spinner.hide();
            btrPWA.modal.success( { 'message' : '"' + transaction.description + '" successfully updated!' } );
          } );
      } );
    }
  };
  btrPWA.list = {
    append : function() {
      btrPWA.fb.db.ref( 'transactions/' + btrPWA.fb.user.uid )
      .once( 'value' )
      .then( snapshot => {
        function appendTransaction( dateCurrent, transaction, tr, tableBody ) {
          tr.querySelector( 'td:nth-of-type(1)' ).innerHTML = transDate( dateCurrent );
          tr.querySelector( 'td:nth-of-type(2)' ).innerHTML = transaction.description;
          tr.querySelector( 'input' ).value = transAmountDisplay( transaction.amount );
          tr.querySelector( 'td:nth-of-type(4)' ).innerHTML = transBalance( transaction.amount );

          btrPWA.append( tableBody, tr.cloneNode( true ) );
        }

        function transAmountDisplay( amount ) {
          return '$' + parseFloat( amount ).toFixed( 2 );
        }

        function transBalance( amount ) {
          const previousRow = document.querySelector( '.table--list tbody tr:last-child' );
          const previousBalance = parseFloat( previousRow.querySelector( 'td:nth-of-type(4)' ).innerHTML.replace( /\$/g, '' ).replace( /,/g, '' ) );
          return '$' + ( parseFloat( amount ) + previousBalance ).toFixed( 2 );
        }

        function transDate( timestamp ) {
          const dateObj = new Date( ( timestamp + 86400 ) * 1000 );
          return ( dateObj.getMonth() + 1 ) + '/' + ( dateObj.getDate() )
        }

        if ( snapshot.val() ) {

          const transactions = snapshot.val();

          const table = document.querySelector( '.table--list' );
          const tableBody = table.querySelector( 'tbody' );

          let dateStart = parseInt( table.getAttribute( 'dateStart' ) );
          if ( isNaN( dateStart) ) {
            dateStart = Math.floor( new Date().getTime() / ( 1000 * 60 * 60 * 24 ) ) * ( 60 * 60 * 24 );
          }
          let dateEnd = parseInt( table.getAttribute( 'dateEnd' ) );
          if ( isNaN( dateEnd ) ) {
            dateEnd   = dateStart + ( 60 * 60 * 24 * 30 );
          }

          const days = 30;

          table.setAttribute( 'dateStart', dateStart );
          table.setAttribute( 'dateEnd', dateEnd );

          const tr = btrPWA.createNode( 'tr' );
          const td = btrPWA.createNode( 'td' );
          const input = btrPWA.createNode( 'input' );

          input.setAttribute( 'type', 'text' );
          input.setAttribute( 'class', 'amount' );

          for ( let i = 0; i < 4; i++ ) {
            btrPWA.append( tr, td.cloneNode() );
          }

          btrPWA.append( tr.querySelector( 'td:nth-of-type(3)'), input );

          for ( let i = 0; i < days; i++ ) {
            const dateCurrent = dateStart + ( i * 60 * 60 * 24 );
            for ( key in transactions ) {
              const transaction = transactions[key];
              const transTimeStamp = Math.round( new Date( transaction['startDate'] ).getTime() / ( 1000 * 60 * 60 * 24 ) ) * ( 60 * 60 * 24 );
              if ( transTimeStamp == dateCurrent ) {
                appendTransaction( dateCurrent, transaction, tr, tableBody );
              } else if ( transaction.repeat == true ) {
                if ( transaction.every == 'daily' ) {
                  appendTransaction( dateCurrent, transaction, tr, tableBody );
                } else if (
                  transaction.every == 'weekly' &&
                  new Date( dateCurrent * 1000 ).getDay() == new Date( transTimeStamp * 1000 ).getDay()
                ) {
                  appendTransaction( dateCurrent, transaction, tr, tableBody );
                } else if (
                  transaction.every == 'biWeekly' &&
                  dateCurrent % ( 60 * 60 * 24 * 14 ) == transTimeStamp % ( 60 * 60 * 24 * 14 )
                 ) {
                  appendTransaction( dateCurrent, transaction, tr, tableBody );
                } else if (
                  transaction.every == 'monthly' &&
                  new Date( dateCurrent * 1000 ).getDate() == new Date( transTimeStamp * 1000 ).getDate()
                ) {
                  appendTransaction( dateCurrent, transaction, tr, tableBody );
                } else if (
                  transaction.every == 'quarterly' &&
                  dateCurrent % ( 60 * 60 * 24 * 90 ) == transTimeStamp % ( 60 * 60 * 24 * 90 )
                ) {
                  appendTransaction( dateCurrent, transaction, tr, tableBody );
                } else if (
                  transaction.every == 'semiMonthly' &&
                  dateCurrent % ( 60 * 60 * 24 * 183 ) == transTimeStamp % ( 60 * 60 * 24 * 183 )
                ) {
                  appendTransaction( dateCurrent, transaction, tr, tableBody );
                } else if (
                  transaction.every == 'yearly' &&
                  dateCurrent % ( 60 * 60 * 24 * 365 ) == transTimeStamp % ( 60 * 60 * 24 * 365 )
                ) {
                  appendTransaction( dateCurrent, transaction, tr, tableBody );
                }
              }
            }
          }

          btrPWA.listeners.update();
        }
      } );
    },
    listeners : function() {
      document.querySelectorAll( '.table--list tbody tr input' ).forEach( ( input, i ) => {
        btrPWA.ael( 'change', input, e => {
          if ( i == 0 ) {
            btrPWA.fb.db.ref( 'balanceStart/' + btrPWA.fb.user.uid ).set( input.value.replace( /\$/g, '' ).replace( /,/g, '' ) );
          }
          btrPWA.list.update();
        } );
      } );
    },
    reset : function() {
      const table = document.querySelector( '.table--list' );
      table.setAttribute( 'dateStart', '' );
      table.setAttribute( 'dateEnd', '' );
      table.querySelectorAll( 'tbody tr:not(:first-child)' ).forEach(tr=>tr.remove());

      btrPWA.fb.db.ref( 'balanceStart/' + btrPWA.fb.user.uid )
      .once( 'value' )
      .then( snapshot => {
        if ( snapshot.val() !== null ) {
          table.querySelector( 'input:first-child' ).value = '$' + parseFloat( snapshot.val() ).toFixed( 2 );
          table.querySelector( 'tr:first-child td:nth-child(4)' ).innerHTML = '$' + parseFloat( snapshot.val() ).toFixed( 2 );
          btrPWA.list.append();
        } else {
          btrPWA.fb.db.ref( 'balanceStart/' + btrPWA.fb.user.uid)
          .set( '0' )
          .then( () => {
            table.querySelector( 'input:first-child' ).value = '$0.00';
            table.querySelector( 'tr:first-child td:nth-child(4)' ).innerHTML = '$0.00';
            btrPWA.list.append();
          } );
        }
      } );
    },
    update : function() {
      document.querySelectorAll( '.table--list tbody tr' ).forEach( ( tr, i ) => {
        const amount = parseFloat( tr.querySelector( 'input' ).value.replace( /\$/g, '' ).replace( /,/g, '' ) );
        if ( i == 0 ) {
          tr.querySelector( 'td:nth-child(4)' ).innerHTML = '$' + amount.toFixed( 2 );
        } else {
          const previousBalance = parseFloat( document.querySelector( '.table--list tbody tr:nth-child(' + i + ') td:nth-child(4)' ).innerHTML.replace( /\$/g, '' ).replace( /,/g, '' ) );
          tr.querySelector( 'td:nth-child(4)' ).innerHTML = '$' + ( amount + previousBalance ).toFixed( 2 );
        }
      } );
    }
  };
  btrPWA.radioAppColor = {
    listeners : function() {
      document.querySelectorAll( 'input[name="appColor"]' ).forEach( appColor => {
        btrPWA.ael( 'change', appColor, e => {
          if ( e.target.checked === true ) {
            btrPWA.fb.db.ref( 'settings/' + btrPWA.fb.user.uid + '/appearance/appColor' ).set( e.target.value );
          }
        } );
      } );
    }
  };
  btrPWA.radioStartScreen = {
    listeners : function() {
      document.querySelectorAll( 'input[name="startScreen"]' ).forEach( startScreen => {
        btrPWA.ael( 'change', startScreen, e => {
          if ( e.target.checked === true ) {
            btrPWA.fb.db.ref( 'settings/' + btrPWA.fb.user.uid + '/startScreen' ).set( e.target.value );
          }
        } );
      } );
    }
  };
  btrPWA.switchDarkMode = {
    listeners : function() {
      btrPWA.ael( 'change', document.querySelector( '.darkMode' ), e => {
        btrPWA.fb.db.ref( 'settings/' + btrPWA.fb.user.uid + '/appearance/darkMode' ).set( e.target.checked );
      } );
    }
  };
  btrPWA.transactionDelete = {
    listeners : function() {
      document.querySelectorAll( '.navigationList--transactions button.delete' ).forEach( button => {
        btrPWA.ael( 'click', button, e => {
          e.preventDefault();
          const navigationItem = e.target.closest( 'navigationItem' );
          const description = navigationItem.querySelector( 'title' ).innerHTML;
          const key = navigationItem.getAttribute( 'key' );
          btrPWA.modal.confirm( {
            message : 'Are you sure you want to remove "' + description + '"?',
            confirm : function() {
              btrPWA.spinner.show();
              btrPWA.fb.db.ref( 'transactions/' + btrPWA.fb.user.uid + '/' + key )
                .remove()
                .then( () => {
                  btrPWA.spinner.hide();
                  btrPWA.modal.success( { 'message' : '"' + description + '" has successfully been removed!'} );
                } );
            }
          } );
        } );
      } );
    }
  };

  btrPWA.init();
} );

if ('serviceWorker' in navigator ) {
  window.addEventListener( 'load', () => {
    navigator.serviceWorker.register( './sw.js' );
  });
}
