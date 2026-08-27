import { Schema, model, Document as MongooseDocument } from "mongoose";

// Matches the contract's PermissionMap shape exactly (checkbox grid: page x action).
export interface IPermissionMap {
  users: {
    view: boolean;
    add: boolean;
    update: boolean;
    delete: boolean;
    verifyDocuments: boolean;
    approveMembership: boolean;
  };
  clubs: {
    view: boolean;
    add: boolean;
    update: boolean;
    delete: boolean;
  };
  payments: {
    view: boolean;
  };
  settings: {
    view: boolean;
    update: boolean;
  };
}

export interface IRole extends MongooseDocument {
  name: string;
  permissions: IPermissionMap;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_PERMISSIONS: IPermissionMap = {
  users: { view: false, add: false, update: false, delete: false, verifyDocuments: false, approveMembership: false },
  clubs: { view: false, add: false, update: false, delete: false },
  payments: { view: false },
  settings: { view: false, update: false },
};

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, trim: true },
    // Stored as Mixed to match the contract's free-form PermissionMap, but
    // always normalized against DEFAULT_PERMISSIONS on write (see
    // roleController) so a partial payload never leaves gaps that would
    // make `permissions.users.view` etc. undefined downstream.
    permissions: { type: Schema.Types.Mixed, required: true, default: DEFAULT_PERMISSIONS },
  },
  { timestamps: true }
);

export const Role = model<IRole>("Role", RoleSchema);
