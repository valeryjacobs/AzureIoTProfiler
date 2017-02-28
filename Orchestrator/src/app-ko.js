ds = deepstream('ws://vjiotprofiler.westeurope.cloudapp.azure.com:6020');
koTools = new KoTools(ko);

var record = ds.record.getRecord('some-name')

ds.login({ username: 'orchestration-admin-' + ds.getUid() }, function () {
	ko.applyBindings(new AppViewModel());
});


$("#start").click(function () {
	ds.rpc.make('start-test', { frequency: $("#frequency").val(), messageSize: 2000 }, (err, result) => {
		// result == 20;
	});
})

record.subscribe('firstname', function (value) {
	$("#state").val(value);
})

$('#state').bind('input propertychange', function () {

	record.set('firstname', $('#state').val())
	ds.event.emit('device/connect', 'I am connected')
});

/**
 * Class AppViewModel
 */
AppViewModel = function () {
	this.users = koTools.getViewList(UserListEntryViewModel, ds.record.getList('users'));
	this.user = new UserViewModel();
};

AppViewModel.prototype.addUser = function () {
	var name = 'users/' + ds.getUid(),
		record = ds.record.getRecord(name);

	record.set({ firstname: 'Admin', lastname: 'Admin', role: '-' });
	this.users.getList().addEntry(name);
};

AppViewModel.prototype.selectUser = function (userAppViewModel) {
	this.user.record.setName(userAppViewModel.record.name);
	this.users.callOnEntries('isActive', [false]);
	userAppViewModel.isActive(true);
};

/**
 * Class UserListEntryViewModel
 */
UserListEntryViewModel = function (userRecordName, viewList) {
	this.record = ds.record.getRecord(userRecordName);
	this.viewList = viewList;
	this.firstname = koTools.getObservable(this.record, 'firstname');
	this.lastname = koTools.getObservable(this.record, 'lastname');
	this.role = koTools.getObservable(this.record, 'role');
	this.isActive = ko.observable(false);
};

UserListEntryViewModel.prototype.deleteUser = function (viewModel, event) {
	event.stopPropagation();
	this.viewList.getList().removeEntry(this.record.name);
	this.record.delete();
};

/**
 * Class UserViewModel
 */
UserViewModel = function () {
	this.record = ds.record.getAnonymousRecord();
	this.firstname = koTools.getObservable(this.record, 'firstname');
	this.lastname = koTools.getObservable(this.record, 'lastname');
	this.role = koTools.getObservable(this.record, 'role');
};