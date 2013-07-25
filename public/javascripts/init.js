/**
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

/**
 * @author Maxim Bogdanov <sin666m4a1fox@gmail.com>
 */

$(document).ready(function(){
   $('.lang span').click(function(){
       var lang = $(this).text().toLowerCase();
       $('.lang span').removeClass('active')
       $(this).addClass('active');
       $('div[class^="lang-"]').hide();
       $('.lang-'+lang).show();
   })
});