const path = require('path')

module.exports = {
    mode: 'development',
    entry: {
      // index: './src/index.js',
      hh_check_availability: './src/hh_check_availability.js',
      // createRooms: './src/createRooms.js',
      // test_update: './src/test_update.js',
      hh_booking_page: './src/hh_booking_page.js',
      hh_review_booking: './src/hh_review_booking.js',
      hh_review_booking_dash: './src/hh_review_booking_dash.js',
      hh_view_packages: './src/hh_view_packages.js',
      // hh_ch_check_availability: './src/hh_ch_check_availability.js',
      hh_mv_edit_room_packages: './src/hh_mv_edit_room_packages.js',
      hh_mv_edit_bookings: './src/hh_mv_edit_bookings.js',
      login: './src/login.js',
      hh_hotel_manager_view: './src/hh_hotel_manager_view.js',
      hh_employee_overview: './src/hh_employee_overview.js',
      hh_mv_edit_customers: './src/hh_mv_edit_customers.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    devtool: 'eval-source-map',
    watch: true,
    module: {
        rules: [
          {
            test: /\.js$/,
            enforce: "pre",
            use: ["source-map-loader"],
          },
        ],
      },
}