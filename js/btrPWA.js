let btrPWA = {
  ael : function( event, node, fn ) {
    if ( node && !node.hasAttribute( 'ael-' + event ) ) {
      node.setAttribute( 'ael-' + event, true );
      node.addEventListener( event, e => {
        fn(e);
      } );
    }
  },
  append : function( parent, element ) {
    return parent.appendChild( element );
  },
  buttonSignOut : {
    listeners : function() {
      btrPWA.ael( 'click', document.querySelector( '.fbSignOut'), e => btrPWA.fb.signout( e ) );
    }
  },
  createNode : function( element ) {
    return document.createElement( element );
  },
  fb : {
    dbRef : {},
    initiated : false,
    listeners : function() {
      btrPWA.ael( 'submit', document.querySelector( '.form--fbReauthenticate' ), e => {
        e.preventDefault();

        const email    = e.target.querySelector( '.email' ).value;
        const password = e.target.querySelector( '.password' ).value;
        const user  = btrPWA.fb.auth.currentUser;

        const credential = firebase.auth.EmailAuthProvider.credential( email, password );

        user.reauthenticateAndRetrieveDataWithCredential( credential )
          .then( () => {
            btrPWA.spinner.hide();
            btrPWA.modal.hideAll();
            btrPWA.modal.success( { 'message' : 'Re-authentication successful!' } );
          } )
          .catch( e => {
            btrPWA.spinner.hide();
            btrPWA.modal.error( { 'message' : e.message } );
          });
      } );
    },
    section : {
      append : 'main'
    },
    signin : function( e ) {
      e.preventDefault();
      btrPWA.spinner.show();

      const email    = e.target.querySelector( '.email' ).value;
      const password = e.target.querySelector( '.password' ).value;

      btrPWA.fb.auth.signInWithEmailAndPassword( email, password )
        .catch( e => {
          btrPWA.spinner.hide();
          btrPWA.modal.error( {'message' : e.message } );
        } );
    },
    signout : function( e = null ) {
      if ( e ) { e.preventDefault(); }
      btrPWA.modal.confirm ( {
        'message' : 'Are you sure you want to sign out?',
        'confirm' : function() {
          btrPWA.spinner.show();
          btrPWA.fb.auth.signOut()
            .then( () => {
              btrPWA.modal.hideAll();
              btrPWA.toolbar.hide();
            } );
        }
      } );
    },
    signup : function( e ) {
      e.preventDefault();
      btrPWA.spinner.show()

      const email    = e.target.querySelector( '.email' ).value;
      const password = e.target.querySelector( '.password' ).value;

      btrPWA.fb.auth.createUserWithEmailAndPassword( email, password )
        .catch( e => {
          btrPWA.spinner.hide();
          btrPWA.modal.error( {'message' : e.message } );
        } );
    },
    state : {
      auth : {
        fetchURLs : [],
        show : function( user ) {
          btrPWA.fb.user = user;
          btrPWA.section.removeAll();
          btrPWA.fetchURLs( btrPWA.fb.state.auth.fetchURLs, btrPWA.fb.section.append, btrPWA.fb.state.auth.success );
        },
        success : function() {}
      },
      notAuth : {
        fetchURLs : ['sections/signin.html', 'sections/signup.html'],
        show : function() {
          btrPWA.section.removeAll();
          btrPWA.fetchURLs( btrPWA.fb.state.notAuth.fetchURLs, btrPWA.fb.section.append, btrPWA.fb.state.notAuth.success );
        },
        success : function() {
          btrPWA.listeners.update();
          btrPWA.section.show( 'signin' );
          btrPWA.spinner.hide();
        }
      }
    }
  },
  fetchURLs : function( urls, append = false, success = false ) {
    return Promise
      .all( urls.map( url =>
        fetch( url ).then( res => res.text() )
      ) )
      .then( htmls => {
        if ( append ) {
          for ( html of htmls ) {
            document.querySelector( append ).innerHTML += html;
          }
        }

        if ( success ) {
          success();
        }
      } );
  },
  init : function() {
    for( method in btrPWA ) {
      if ( btrPWA[method].hasOwnProperty( 'init' ) ) {
        btrPWA[method].init();
      }
    }
    btrPWA.listeners.update();
  },
  listeners : {
    update : function() {
      for( method in btrPWA ) {
        if ( btrPWA[method].hasOwnProperty( 'listeners' ) ) {
          btrPWA[method].listeners();
        }
      }
    }
  },
  modal : {
    confirm : function( params ) {
      document.querySelector( '.modal--confirm message' ).innerHTML = params.message;
      if ( params.hasOwnProperty( 'confirm' ) ) {
        document.querySelector( '.modal--confirm .confirm' ).addEventListener( 'click', e => {
          e.preventDefault();
          if ( params.confirm !== null ) {
            params.confirm();
            params.confirm = null;
          }
        } );
      }
      btrPWA.modal.show( 'confirm' );
    },
    error : function( params ) {
      document.querySelector( '.modal--error message').innerHTML = params.message;
      btrPWA.modal.show( 'error' );
    },
    hideAll : function() {
      document.querySelector( 'modalContainer' ).classList.remove( 'show' );
      document.querySelectorAll( 'modal' ).forEach( modal => modal.classList.remove( 'show' ) );
    },
    init : function() {
      if ( btrPWA.modal.hasOwnProperty( 'fetchURLs' ) ) {
        btrPWA.fetchURLs( btrPWA.modal.fetchURLs, 'modalContainer', e => {
          if ( !navigator.onLine ) {
            btrPWA.modal.show( 'offline' );
          }
        } );
      }
    },
    fetchURLs : ['modals/confirm.html', 'modals/error.html', 'modals/fbReauthenticate.html', 'modals/offline.html', 'modals/success.html'],
    listeners : function() {
      document.querySelectorAll( '.closeModal' ).forEach( closeModal => {
        btrPWA.ael( 'click', closeModal, e => {
          e.preventDefault();
          btrPWA.modal.hideAll();
        } );
      } );
    },
    show : function( modal ) {
      document.querySelector( 'modalContainer' ).classList.add( 'show' );
      document.querySelector( '.modal--' + modal ).classList.add( 'show' );
    },
    success : function( params ) {
      document.querySelector( '.modal--success message').innerHTML = params.message;
      btrPWA.modal.show( 'success' );
    }
  },
  navigationItem : {
    listeners : function() {
      document.querySelectorAll( '.navigationList--editable' ).forEach( navigationList => {
        let fbPath = navigationList.getAttribute( 'fbPath' ).replace( '$uid', btrPWA.fb.user.uid );
        const form = document.querySelector( '.' + navigationList.getAttribute( 'form' ) );
        const subMenuNew = navigationList.getAttribute( 'subMenuNew' );
        const subMenuOld = navigationList.getAttribute( 'subMenuOld' );
        navigationList.querySelectorAll( 'navigationItem' ).forEach( navigationItem => {
          btrPWA.ael( 'click', navigationItem, e => {
            if ( e.target.nodeName === 'NAVIGATIONITEM' ) {
              btrPWA.spinner.show();
              const key = e.target.getAttribute( 'key' );
              fbPath = fbPath.replace( '$key', key );
              btrPWA.fb.db.ref( fbPath )
                .once( 'value' )
                .then( snapshot => {
                  const transaction = snapshot.val();
                  form.querySelectorAll( 'input, select' ).forEach( input => {
                    const field = input.getAttribute( 'class' );
                    if ( input.getAttribute( 'type' ) !== 'checkbox' ) {
                      input.value = transaction[field];
                    } else {
                      input.checked = transaction[field];
                    }
                  } );
                  form.querySelector( '.key' ).value = key;
                  document.querySelector( '.section--' + subMenuNew ).classList.remove( 'right' );
                  document.querySelector( '.section--' + subMenuOld ).classList.add( 'left' );
                  btrPWA.spinner.hide();
                } );
            }
          } );
        } );
      } );
    }
  },
  section : {
    hideAll : function() {
      document.querySelectorAll( 'sectionContainer' ).forEach( section => {
        section.classList.remove( 'show' );
      } );
    },
    listeners : function() {
      document.querySelectorAll( 'addButton' ).forEach( addButton => {
        btrPWA.ael( 'click', addButton, e => {
          e.preventDefault();
          const subMenuNew = e.target.getAttribute( 'subMenu' );
          const subMenuOld = e.target.closest( 'section' );

          document.querySelector( '.section--' + subMenuNew ).classList.remove( 'right' );
          subMenuOld.classList.add( 'left' );
        } );
      } );

      document.querySelectorAll( 'backButton' ).forEach( backButton => {
        btrPWA.ael( 'click', backButton, e => {
          e.preventDefault();
          const subMenuNew = e.target.getAttribute( 'subMenu' );
          const subMenuOld = e.target.closest( 'section' );

          document.querySelector( '.section--' + subMenuNew ).classList.remove( 'left' );
          subMenuOld.classList.add( 'right' );
        } );
      } );

      document.querySelectorAll( '.sectionShow' ).forEach( sectionShow => {
        btrPWA.ael( 'click', sectionShow, e => {
          e.preventDefault();
          const newSection = e.target.getAttribute( 'sectionShow' );
          btrPWA.section.show( newSection );
        } );
      } );

      document.querySelectorAll( '.showSubMenu' ).forEach( showSubMenu => {
        btrPWA.ael( 'click', showSubMenu, e => {
          e.preventDefault();
          const subMenuNew = e.target.getAttribute( 'subMenuNew');
          const subMenuOld = e.target.getAttribute( 'subMenuOld');
          document.querySelector( '.section--' + subMenuNew ).classList.remove( 'right' );
          document.querySelector( '.section--' + subMenuOld ).classList.add( 'left' );
        } );
      } );
    },
    removeAll : function() {
      document.querySelectorAll( 'sectionContainer' ).forEach( sectionContainer => {
        sectionContainer.remove();
      } );
    },
    show : function( section ) {
      btrPWA.section.hideAll();
      document.querySelector( '.sectionContainer--' + section ).classList.add( 'show' );
      btrPWA.toolbar.update( section );
    }
  },
  spinner : {
    hide : function() {
      document.querySelector( 'spinnerContainer' ).classList.remove( 'show' );
    },
    init : function() {
      if ( !navigator.onLine ) {
        btrPWA.spinner.hide();
      }
    },
    show : function() {
      document.querySelector( 'spinnerContainer' ).classList.add( 'show' );
    }
  },
  toolbar : {
    appendItems : function() {
      const toolbar = btrPWA.createNode( 'toolbar' );

      if ( btrPWA.toolbar.hasOwnProperty( 'toolbars' ) ) {
        for ( toolbarItemObj of btrPWA.toolbar.toolbars ) {
          let toolbarItem = btrPWA.createNode( 'toolbarItem' );
          let icon = btrPWA.createNode( 'i' );
          icon.setAttribute( 'class', toolbarItemObj.i );

          for ( attr in toolbarItemObj ) {
            if ( attr !== 'i' ) {
              toolbarItem.setAttribute( attr, toolbarItemObj[attr] );
            }

            btrPWA.append( toolbarItem, icon );
            btrPWA.append( toolbar, toolbarItem );
          }
        }
      }

      btrPWA.append( document.querySelector( 'app' ), toolbar );
    },
    hide : function() {
      if( document.querySelector( 'toolbar' ) ) { document.querySelector( 'toolbar' ).remove(); }
    },
    listeners : function() {
      document.querySelectorAll( 'toolbarItem' ).forEach( toolbarItem => {
        btrPWA.ael( 'click', toolbarItem, e => {
          e.preventDefault();
          if ( e.target.hasAttribute( 'sectionContainer' ) ) {
            btrPWA.section.show( e.target.getAttribute( 'sectionContainer' ) );
          }
        } );
      } );
    },
    show : function () {
      if ( !document.querySelector( 'toolbar' ) ) { btrPWA.toolbar.appendItems() };
    },
    toolbars : [],
    update : function( section ) {
      document.querySelectorAll( 'toolbarItem' ).forEach( toolbarItem => {
        if ( toolbarItem.hasAttribute( 'sectionContainer' ) ) {
          if ( toolbarItem.getAttribute( 'sectionContainer' ) === section ) {
           toolbarItem.classList.add( 'current' );
          } else {
           toolbarItem.classList.remove( 'current' );
          }
        }
      } );
    }
  },
  zonlineStatus : {
    init : function() {
      window.addEventListener( 'online', () => btrPWA.zonlineStatus.update() );
      window.addEventListener( 'offline', () => btrPWA.zonlineStatus.update() );
      btrPWA.zonlineStatus.update();
    },
    update : function() {
      btrPWA.spinner.hide();
      if ( !navigator.onLine ) {
        btrPWA.modal.show( 'offline' );
        btrPWA.spinner.hide();
      } else {
        btrPWA.modal.hideAll();
        if ( !btrPWA.fb.initiated ) {
          btrPWA.fb.auth = firebase.auth();
          btrPWA.fb.db   = firebase.database();

          btrPWA.fb.initiated = true;
          btrPWA.fb.auth.onAuthStateChanged( user => {
            if ( user ) {
              btrPWA.fb.state.auth.show( user );
            } else {
              btrPWA.fb.state.notAuth.show();
            }
          } );
        }
      }
    }
  }
}
