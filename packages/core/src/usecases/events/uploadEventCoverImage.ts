import { UserRoles } from "../../models";
import { ErrorCodes, getInjection, UnauthorizedError } from "../../types";

export const uploadImageUseCase = async (file: File | Blob): Promise<string> => {
  const authService = await getInjection("IAuthenticationService");
  const user = await authService.getUser();

  if (!user) {
      throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
  }
  user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
  
  const imageUploadService = await getInjection('IImageUploadService');
  const bucketName = 'evenements';
  const folderPath = `evenements`;
  const publicUrl = await imageUploadService.uploadImage(file, bucketName, folderPath, false);

  return publicUrl;
};
